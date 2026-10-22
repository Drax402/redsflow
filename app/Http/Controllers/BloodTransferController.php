<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BloodBag;
use App\Models\BloodTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BloodTransferController extends Controller
{
    public function index()
    {
        $transfers = BloodTransfer::orderByDesc('transferred_on')->orderByDesc('id')->get();

        return response()->json(['transfers' => $transfers->map->toFrontendArray()]);
    }

    public function destroyMany(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'integer',
        ]);

        $transfers = BloodTransfer::whereIn('id', $data['ids'])->get();
        DB::transaction(function () use ($transfers, $request) {
            foreach ($transfers as $transfer) {
                $bag = $transfer->blood_bag_id ? BloodBag::find($transfer->blood_bag_id) : null;
                if ($bag && in_array($bag->status, ['Transferred', 'Released'], true)) {
                    $bag->update(['status' => 'In Stock', 'closed_at' => null]);
                }
                $label = $transfer->kind === 'patient' ? 'patient release' : 'blood transfer';
                $transfer->delete();
                AuditLog::recordDonorAction($request->user()?->id, 'Delete', $bag?->donor_id, $bag?->donor_name ?? 'Blood bag',
                    "Deleted {$label} record for bag {$transfer->bag_code}; the bag is back In Stock.");
            }
        });

        return response()->json(['deleted' => $transfers->count()]);
    }

    public function update(Request $request, BloodTransfer $transfer)
    {
        $data = $request->validate([
            'destination' => 'nullable|string|max:150',
            'patientName' => 'nullable|string|max:120',
            'reason' => 'nullable|string|max:160',
            'remarks' => 'nullable|string|max:500',
            'transferredOn' => 'required|date',
        ]);

        $destination = trim((string) ($data['destination'] ?? ''));
        $patient = trim((string) ($data['patientName'] ?? ''));
        $reason = trim((string) ($data['reason'] ?? ''));
        $remarks = trim((string) ($data['remarks'] ?? ''));

        if ($transfer->kind === 'hospital' && $destination === '') {
            return response()->json(['message' => 'Please enter the hospital or place where the blood is transferred.'], 422);
        }
        if ($transfer->kind === 'patient' && ($patient === '' || $reason === '')) {
            return response()->json(['message' => 'Please enter the patient name and the reason (e.g. accident).'], 422);
        }
        if (Carbon::parse($data['transferredOn'])->toDateString() > Carbon::now('Asia/Manila')->toDateString()) {
            return response()->json(['message' => 'The date cannot be in the future.'], 422);
        }

        $old = [
            'Hospital / Place' => (string) $transfer->destination,
            'Patient' => (string) $transfer->patient_name,
            'Reason' => (string) $transfer->reason,
            'Remarks' => (string) $transfer->remarks,
            'Date' => optional($transfer->transferred_on)->format('m-d-Y'),
        ];
        $transfer->update([
            'destination' => $destination !== '' ? $destination : null,
            'patient_name' => $transfer->kind === 'patient' ? $patient : null,
            'reason' => $reason !== '' ? $reason : null,
            'remarks' => $remarks !== '' ? $remarks : null,
            'transferred_on' => Carbon::parse($data['transferredOn'])->toDateString(),
        ]);
        $new = [
            'Hospital / Place' => $destination,
            'Patient' => $transfer->kind === 'patient' ? $patient : '',
            'Reason' => $reason,
            'Remarks' => $remarks,
            'Date' => Carbon::parse($data['transferredOn'])->format('m-d-Y'),
        ];
        $parts = [];
        foreach ($new as $label => $value) {
            if ((string) $old[$label] !== (string) $value) {
                $parts[] = $label . ': ' . ($old[$label] !== '' && $old[$label] !== null ? $old[$label] : 'None') . ' > ' . ($value !== '' ? $value : 'None');
            }
        }
        if (!$parts) {
            return response()->json(['message' => 'No changes were made.'], 422);
        }

        $bag = $transfer->blood_bag_id ? BloodBag::find($transfer->blood_bag_id) : null;
        AuditLog::recordDonorAction($request->user()?->id, 'Update', $bag?->donor_id, $bag?->donor_name ?? 'Blood bag',
            "Updated Information:\nChange: " . implode("\nChange: ", $parts));

        return response()->json(['transfer' => $transfer->fresh()->toFrontendArray()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kind' => 'required|in:hospital,patient',
            'bagIds' => 'required|array|min:1|max:50',
            'bagIds.*' => 'integer',
            'destination' => 'nullable|string|max:150',
            'patientName' => 'nullable|string|max:120',
            'reason' => 'nullable|string|max:160',
            'remarks' => 'nullable|string|max:500',
            'transferredOn' => 'required|date',
        ]);

        $kind = $data['kind'];
        $destination = trim((string) ($data['destination'] ?? ''));
        $patient = trim((string) ($data['patientName'] ?? ''));
        $reason = trim((string) ($data['reason'] ?? ''));

        if ($kind === 'hospital' && $destination === '') {
            return response()->json(['message' => 'Please enter the hospital or place where the blood is transferred.'], 422);
        }
        if ($kind === 'patient' && ($patient === '' || $reason === '')) {
            return response()->json(['message' => 'Please enter the patient name and the reason (e.g. accident).'], 422);
        }
        if (Carbon::parse($data['transferredOn'])->toDateString() > Carbon::now('Asia/Manila')->toDateString()) {
            return response()->json(['message' => 'The transfer date cannot be in the future.'], 422);
        }

        $ids = array_values(array_unique($data['bagIds']));
        $bags = BloodBag::whereIn('id', $ids)->where('status', 'In Stock')->get();
        if ($bags->count() !== count($ids)) {
            return response()->json(['message' => 'Some selected bags are no longer In Stock. Please reload and try again.'], 422);
        }
        foreach ($bags as $bag) {
            if ($bag->expiryLevel() === 3) {
                return response()->json(['message' => "Bag {$bag->bag_code} is expired and cannot be transferred."], 422);
            }
        }

        $user = $request->user();
        $created = DB::transaction(function () use ($bags, $kind, $destination, $patient, $reason, $data, $user) {
            $rows = [];
            foreach ($bags as $bag) {
                $rows[] = BloodTransfer::create([
                    'kind' => $kind,
                    'blood_bag_id' => $bag->id,
                    'bag_code' => $bag->bag_code,
                    'component' => $bag->component,
                    'blood_type' => $bag->blood_type,
                    'destination' => $destination !== '' ? $destination : null,
                    'patient_name' => $kind === 'patient' ? $patient : null,
                    'reason' => $reason !== '' ? $reason : null,
                    'remarks' => trim((string) ($data['remarks'] ?? '')) ?: null,
                    'transferred_on' => Carbon::parse($data['transferredOn'])->toDateString(),
                    'recorded_by' => $user?->id,
                    'recorded_by_name' => $user?->name,
                ]);
                $bag->update(['status' => $kind === 'patient' ? 'Released' : 'Transferred', 'closed_at' => now()]);
            }

            return $rows;
        });

        foreach ($bags as $bag) {
            $to = $kind === 'patient' ? "patient {$patient}" . ($destination !== '' ? " ({$destination})" : '') : $destination;
            AuditLog::recordDonorAction($user?->id, 'Update', $bag->donor_id, $bag->donor_name,
                "Blood bag {$bag->bag_code} ({$bag->component}, {$bag->blood_type}) transferred to {$to}" . ($reason !== '' ? ". Reason: {$reason}" : '') . '.');
        }

        return response()->json(['transfers' => collect($created)->map->toFrontendArray()], 201);
    }
}
