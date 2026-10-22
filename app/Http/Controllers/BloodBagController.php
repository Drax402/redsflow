<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BloodBag;
use App\Models\Donor;
use App\Models\StorageUnit;
use App\Support\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BloodBagController extends Controller
{
    public function index()
    {
        $this->syncAlerts();

        return response()->json([
            'bags' => BloodBag::with('unit')->orderByDesc('collected_on')->orderByDesc('id')->get()->map->toFrontendArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'donorId' => 'required|integer|exists:donors,id',
            'component' => 'required|in:Whole Blood,Red Cells,Platelets,Plasma',
            'collectedOn' => 'required|date',
            'expiresOn' => 'nullable|date',
            'result' => 'required|in:Usable,Rejected',
            'storageUnitId' => 'nullable|string|max:20',
            'storageOther' => 'nullable|string|max:60',
            'bloodCenter' => 'required|string|max:120',
            'shelf' => 'nullable|string|max:40',
            'bagCode' => ['nullable', 'string', 'max:40', 'regex:/^[A-Za-z0-9_-]+$/'],
        ]);

        if (Carbon::parse($data['collectedOn'])->toDateString() > Carbon::now('Asia/Manila')->toDateString()) {
            return response()->json(['message' => 'The Date Collected cannot be in the future.'], 422);
        }

        $donor = Donor::findOrFail($data['donorId']);
        $extra = $donor->extra ?? [];
        $eligibility = $extra['eligibilityStatus'] ?? 'Eligible';
        if ($eligibility !== 'Eligible') {
            return response()->json(['message' => 'Only Eligible donors can be recorded.'], 422);
        }
        if (!$donor->blood_type || $donor->blood_type === 'Unknown') {
            return response()->json(['message' => 'Please update the donor blood type first. A bag cannot be recorded for an Unknown blood type.'], 422);
        }

        $usable = $data['result'] === 'Usable';
        $unitId = null;
        $location = null;
        if ($usable) {
            if (($data['storageUnitId'] ?? '') === 'others') {
                $location = trim((string) ($data['storageOther'] ?? ''));
                if ($location === '') {
                    return response()->json(['message' => 'Please specify the storage location.'], 422);
                }
            } else {
                $unit = StorageUnit::find($data['storageUnitId'] ?? 0);
                if (!$unit || $unit->kind !== (BloodBag::COMPONENTS[$data['component']]['kind'])) {
                    return response()->json(['message' => BloodBag::locationHint($data['component'])], 422);
                }
                $unitId = $unit->id;
            }
            if (trim((string) ($data['shelf'] ?? '')) === '') {
                return response()->json(['message' => 'Please specify exactly where the blood is placed.'], 422);
            }
        }

        $collected = Carbon::parse($data['collectedOn'])->startOfDay();
        $bagCode = trim((string) ($data['bagCode'] ?? ''));
        if ($bagCode !== '' && BloodBag::where('bag_code', $bagCode)->exists()) {
            return response()->json(['message' => 'This Bag ID is already used. Please enter a different Bag ID.'], 422);
        }
        $expires = $collected->copy()->addDays(BloodBag::COMPONENTS[$data['component']]['days']);
        if (!empty($data['expiresOn'])) {
            $custom = Carbon::parse($data['expiresOn'])->startOfDay();
            if ($custom->lt($collected)) {
                return response()->json(['message' => 'The Expiration Date cannot be earlier than the Date Collected.'], 422);
            }
            $expires = $custom;
        }

        $bag = BloodBag::create([
            'bag_uid' => 'bag_' . uniqid(),
            'bag_code' => $bagCode !== '' ? $bagCode : $this->nextBagCode($collected),
            'blood_center' => trim($data['bloodCenter']),
            'donor_id' => $donor->id,
            'donor_name' => $donor->name,
            'blood_type' => $donor->blood_type,
            'component' => $data['component'],
            'units' => 1,
            'collected_on' => $collected->toDateString(),
            'expires_on' => $expires->toDateString(),
            'result' => $data['result'],
            'storage_location' => $usable ? $location : null,
            'storage_unit_id' => $unitId,
            'shelf' => $usable ? trim($data['shelf']) : null,
            'status' => $usable ? 'In Stock' : 'Rejected',
            'recorded_by' => $request->user()?->id,
        ]);

        $bag->load('unit');
        $where = $bag->unit ? $bag->unit->label() : $bag->storage_location;
        $detail = $usable
            ? "Collected bag {$bag->bag_code} recorded: {$bag->component} (1 Bag), {$bag->blood_center}, {$where}" . ($bag->shelf ? " - {$bag->shelf}" : '') . ", expires {$expires->toFormattedDateString()}."
            : "Collected bag recorded as Rejected: {$bag->component} (1 Bag).";
        AuditLog::recordDonorAction($request->user()?->id, 'Create', $donor->id, $donor->name, $detail);

        return response()->json(['bag' => $bag->toFrontendArray()], 201);
    }

    public function close(Request $request, BloodBag $bag, string $as)
    {
        abort_unless(in_array($as, ['used', 'disposed'], true), 404);
        if ($bag->status !== 'In Stock') {
            return response()->json(['message' => 'This bag is no longer in stock.'], 422);
        }

        $bag->update(['status' => $as === 'used' ? 'Used' : 'Disposed', 'closed_at' => now()]);
        $detail = $as === 'used'
            ? "Blood bag marked as Used: {$bag->component} ({$bag->blood_type})."
            : "Blood bag disposed: {$bag->component} ({$bag->blood_type}), expiry {$bag->expires_on->toFormattedDateString()}.";
        AuditLog::recordDonorAction($request->user()?->id, 'Update', $bag->donor_id, $bag->donor_name, $detail);

        return response()->json(['bag' => $bag->toFrontendArray()]);
    }

    public function destroyMany(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'integer',
        ]);

        $bags = BloodBag::whereIn('id', $data['ids'])->get();
        foreach ($bags as $bag) {
            $detail = "Blood bag record deleted: {$bag->bag_code} ({$bag->component}, {$bag->blood_type}, status {$bag->status}).";
            $bag->delete();
            AuditLog::recordDonorAction($request->user()?->id, 'Delete', $bag->donor_id, $bag->donor_name, $detail);
        }

        return response()->json(['deleted' => $bags->count()]);
    }

    public function disposeExpired(Request $request)
    {
        $bags = BloodBag::where('status', 'In Stock')->whereDate('expires_on', '<', Carbon::today())->get();
        foreach ($bags as $bag) {
            $bag->update(['status' => 'Disposed', 'closed_at' => now()]);
            AuditLog::recordDonorAction($request->user()?->id, 'Update', $bag->donor_id, $bag->donor_name,
                "Expired blood bag disposed: {$bag->component} ({$bag->blood_type}), expired {$bag->expires_on->toFormattedDateString()}.");
        }

        return response()->json(['disposed' => $bags->count()]);
    }

    private function nextBagCode(Carbon $collected): string
    {
        $prefix = 'BAG-' . $collected->format('Ymd') . '-';
        $n = BloodBag::whereDate('collected_on', $collected->toDateString())->count() + 1;
        while (BloodBag::where('bag_code', $prefix . str_pad((string) $n, 3, '0', STR_PAD_LEFT))->exists()) {
            $n++;
        }

        return $prefix . str_pad((string) $n, 3, '0', STR_PAD_LEFT);
    }

    private function syncAlerts(): void
    {
        $bags = BloodBag::with('unit')->where('status', 'In Stock')->get();
        foreach ($bags as $bag) {
            $level = $bag->expiryLevel();
            if ($level === 0 || $level <= (int) $bag->alerted_level) {
                continue;
            }
            $left = $bag->daysLeft();
            $date = $bag->expires_on->toFormattedDateString();
            $days = $left === 0 ? 'today' : "in {$left} day" . ($left === 1 ? '' : 's');
            $when = $level === 3
                ? "EXPIRED on {$date} — dispose now"
                : ($level === 2 ? "expires {$days} ({$date}) — expiring very soon, prepare for disposal" : "expires {$days} ({$date}) — on the watch list");
            ActivityLog::notifyAdmins("Blood Expiration Alert: {$bag->component} ({$bag->blood_type}) from {$bag->donor_name}, stored in {$bag->unit?->label()}{$bag->storage_location}, {$when}.", null, 'blood_expiry');
            $bag->update(['alerted_level' => $level]);
        }
    }
}
