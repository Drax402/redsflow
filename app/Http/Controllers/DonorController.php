<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Donor;
use App\Support\ActivityLog;
use App\Support\ChangeDiff;
use Illuminate\Http\Request;

class DonorController extends Controller
{
    public function index()
    {
        return response()->json([
            'donors' => Donor::orderBy('id')->get()->map->toFrontendArray(),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()?->hasRoleAdmin()) {
            return response()->json(['message' => 'A new donor created by Staff must be submitted for the Administrator approval.'], 403);
        }

        $donor = self::createFromPayload($request->all());

        AuditLog::recordDonorAction($request->user()?->id, 'Create', $donor->id, $donor->name,
            'New donor created' . (!empty($donor->extra['venue']) ? ' — Venue: ' . $donor->extra['venue'] : '') . '.');

        return response()->json(['donor' => $donor->toFrontendArray()], 201);
    }

    public static function createFromPayload(array $body): Donor
    {
        unset($body['_fieldLabels'], $body['_auditDetails']);

        return Donor::create([
            'donor_uid' => 'donor_' . uniqid(),
            'name' => $body['name'] ?? '',
            'blood_type' => $body['bloodType'] ?? null,
            'contact' => $body['contact'] ?? null,
            'brgy' => $body['brgy'] ?? null,
            'gender' => $body['sex'] ?? $body['gender'] ?? null,
            'dob' => (!empty($body['bday']) && strtotime($body['bday'])) ? $body['bday'] : null,
            'extra' => $body,
        ]);
    }

    public function update(Request $request, Donor $donor)
    {
        $body = $request->all();
        if (!$request->user()?->hasRoleAdmin()) {
            $body = array_intersect_key($body, array_flip(['lastDonation', 'timesDonated']));
            if (empty($body)) {
                return response()->json(['message' => 'Only the Administrator can edit donor information. Please submit an edit request.'], 403);
            }
            $donor->update(['extra' => array_merge($donor->extra ?? [], $body)]);
            return response()->json(['donor' => $donor->toFrontendArray()]);
        }
        unset($body['_auditDetails']);

        $before = $donor->toFrontendArray();

        $donor->update([
            'name' => $body['name'] ?? $donor->name,
            'blood_type' => $body['bloodType'] ?? $donor->blood_type,
            'contact' => $body['contact'] ?? $donor->contact,
            'brgy' => $body['brgy'] ?? $donor->brgy,
            'gender' => $body['sex'] ?? $body['gender'] ?? $donor->gender,
            'dob' => (!empty($body['bday']) && strtotime($body['bday'])) ? $body['bday'] : $donor->dob,
            'extra' => array_merge($donor->extra ?? [], $body),
        ]);

        $details = ChangeDiff::format(ChangeDiff::between($before, $donor->fresh()->toFrontendArray()));
        if ($details !== '') {
            AuditLog::recordDonorAction($request->user()?->id, 'Update', $donor->id, $donor->name, $details);
        }

        return response()->json(['donor' => $donor->toFrontendArray()]);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        $donors = Donor::whereIn('id', $ids)->get();
        foreach ($donors as $donor) {
            AuditLog::recordDonorAction($request->user()?->id, 'Delete', $donor->id, $donor->name, 'Donor removed from masterlist.');
        }
        Donor::whereIn('id', $ids)->delete();
        if ($donors->count() > 0) {
            ActivityLog::staffActivity($request->user(), 'deleted ' . $donors->count() . ' donor' . ($donors->count() === 1 ? '' : 's') . ' from the Masterlist', 'update_donor');
        }

        return response()->json(['deleted' => count($ids)]);
    }
}
