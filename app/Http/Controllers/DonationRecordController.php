<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\MonitoringRecord;
use App\Support\ActivityLog;
use App\Support\ChangeDiff;
use Illuminate\Http\Request;

class DonationRecordController extends Controller
{
    public function index()
    {
        return response()->json([
            'records' => MonitoringRecord::orderBy('id')->get()->map->toFrontendArray(),
        ]);
    }

    public function upsert(Request $request)
    {
        $body = $request->all();
        $existingId = $body['id'] ?? null;
        unset($body['_auditDetails']);
        if (!empty($body['_directEdit']) && !$request->user()?->hasRoleAdmin()) {
            return response()->json(['message' => 'Only the Administrator can edit a record.'], 403);
        }
        unset($body['_directEdit']);
        if (empty($body['status'])) {
            $body['status'] = 'Approved';
        }

        $record = $existingId ? MonitoringRecord::find($existingId) : null;

        $attributes = [
            'donor_id' => $body['donorId'] ?? null,
            'donation_date' => $body['donationDate'] ?? now()->toDateString(),
            'blood_type' => $body['bloodType'] ?? null,
            'times_donated' => (int) ($body['timesDonated'] ?? 1),
            'extra' => $body,
        ];

        $donorName = $body['name'] ?? 'Unknown Donor';

        if ($record) {
            $keys = ['name', 'location', 'bloodType', 'timesDonated', 'amount', 'donationDate', 'lastDonation'];
            $old = array_merge($record->extra ?? [], ['donationDate' => $record->extra['donationDate'] ?? optional($record->donation_date)->toDateString()]);
            $record->update($attributes);
            $details = ChangeDiff::format(ChangeDiff::between($old, $body, $keys));
            if ($details !== '') {
                AuditLog::recordDonorAction($request->user()?->id, 'Update', $record->donor_id, $donorName, $details);
            }
        } else {
            $attributes['record_uid'] = 'rec_' . uniqid();
            $record = MonitoringRecord::create($attributes);
            AuditLog::recordDonorAction($request->user()?->id, 'Create', $record->donor_id, $donorName, 'History Record created' . (isset($body['donationDate']) ? ' — New Donation: ' . $body['donationDate'] : '') . ' — Times Donated: ' . ($body['timesDonated'] ?? 1) . '.');
            ActivityLog::staffActivity($request->user(), 'created a History Record', 'update_record');
        }

        $record->syncTransactions();

        return response()->json(['record' => $record->toFrontendArray()], $existingId ? 200 : 201);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        $records = MonitoringRecord::whereIn('id', $ids)->get();
        foreach ($records as $record) {
            AuditLog::recordDonorAction($request->user()?->id, 'Delete', $record->donor_id, $record->extra['name'] ?? 'Unknown Donor', 'History Record deleted.');
        }
        MonitoringRecord::whereIn('id', $ids)->delete();
        foreach ($records->pluck('donor_id')->filter()->unique() as $donorId) {
            if (!MonitoringRecord::where('donor_id', $donorId)->exists() && ($donor = \App\Models\Donor::find($donorId))) {
                $donor->update(['extra' => array_merge($donor->extra ?? [], ['lastDonation' => 'N/A', 'timesDonated' => 0])]);
            }
        }
        if ($records->count() > 0) {
            ActivityLog::staffActivity($request->user(), 'deleted ' . $records->count() . ' History Record' . ($records->count() === 1 ? '' : 's'), 'update_record');
        }

        return response()->json(['deleted' => count($ids)]);
    }
}
