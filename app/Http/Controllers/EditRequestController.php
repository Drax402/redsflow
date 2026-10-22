<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Donor;
use App\Models\EditRequest;
use App\Models\MonitoringRecord;
use App\Support\ActivityLog;
use App\Support\ChangeDiff;
use Illuminate\Http\Request;

class EditRequestController extends Controller
{
    private const COLUMN_MAP = [
        'name' => 'name', 'bloodType' => 'blood_type', 'contact' => 'contact', 'brgy' => 'brgy',
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $q = EditRequest::with(['requester', 'reviewer'])->orderByDesc('id');
        if ($user->hasRoleMedTech()) {
            $q->where(function ($w) use ($user) {
                $w->whereIn('type', ['donor_create', 'history_record'])->orWhere('requested_by', $user->id);
            });
        } elseif (!$user->hasRoleAdmin()) {
            $q->where('requested_by', $user->id)->where('hidden_by_requester', false);
        }

        return response()->json(['requests' => $q->get()->map->toFrontendArray()]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'type' => 'required|in:donor_edit,history_record,donor_create',
            'donorId' => 'nullable|integer',
            'donorName' => 'required|string|max:255',
            'payload' => 'required|array',
            'original' => 'nullable|array',
            'reason' => 'nullable|string|max:1000',
            'fieldLabels' => 'nullable|array',
        ]);

        if ($user->hasRoleAdmin() && !in_array($data['type'], ['donor_create', 'history_record'], true)) {
            return response()->json(['message' => 'Administrators edit directly — no request is needed.'], 422);
        }

        if ($data['type'] === 'donor_edit' && trim((string) ($data['reason'] ?? '')) === '') {
            return response()->json(['message' => 'Please enter your reason to update or edit the donor information.'], 422);
        }

        $payload = $data['payload'];
        if (!empty($data['fieldLabels'])) {
            $payload['_fieldLabels'] = array_values($data['fieldLabels']);
        }

        $req = EditRequest::create([
            'requested_by' => $user->id,
            'type' => $data['type'],
            'donor_id' => $data['donorId'] ?? null,
            'donor_name' => $data['donorName'],
            'payload' => $payload,
            'original' => $data['original'] ?? [],
            'reason' => $data['reason'] ?? null,
            'status' => 'Pending',
        ]);

        if ($data['type'] === 'donor_edit') {
            $diff = ChangeDiff::format(ChangeDiff::between($data['original'] ?? [], $data['payload'], array_keys($data['payload'])));
            $diff = $diff !== '' ? $diff : 'Change: ' . (!empty($data['fieldLabels']) ? implode(', ', $data['fieldLabels']) : 'donor information');
            $inline = trim(str_replace(["Updated Information:\n", "\n"], ['', '; '], $diff));
            $msg = "{$user->name} ({$user->role}) submitted an edit request for donor {$data['donorName']} — {$inline}.";
            $auditMsg = "Edit request submitted by {$user->name} for donor {$data['donorName']}.\n{$diff}\nReason: {$data['reason']}";
            $category = 'edit_request';
        } elseif ($data['type'] === 'donor_create') {
            $venue = trim((string) ($data['payload']['venue'] ?? ''));
            $msg = "{$user->name} ({$user->role}) created a new donor {$data['donorName']}" . ($venue !== '' ? " — Venue: {$venue}" : '') . ' — Status: Pending, waiting for your approval.';
            $auditMsg = "New donor {$data['donorName']} submitted by {$user->name}" . ($venue !== '' ? " — Venue: {$venue}" : '') . ' — Status: Pending.';
            $category = 'donor_pending';
        } else {
            $msg = "{$user->name} ({$user->role}) submitted a History Record for donor {$data['donorName']} — Status: Pending, waiting for your approval.";
            $auditMsg = $msg;
            $category = 'record_pending';
        }
        ActivityLog::notifyAdmins($msg, $user->id, $category);
        AuditLog::record($user->id, 'edit_request_submitted', $auditMsg);

        return response()->json(['request' => $req->load('requester')->toFrontendArray()], 201);
    }

    public function approve(Request $request, EditRequest $editRequest)
    {
        if ($editRequest->status !== 'Pending') {
            return response()->json(['message' => 'This request was already reviewed.'], 422);
        }

        if ($editRequest->type === 'donor_edit') {
            $this->applyDonorEdit($editRequest, $request);
        } elseif ($editRequest->type === 'donor_create') {
            $this->applyDonorCreate($editRequest, $request);
        }

        $editRequest->update([
            'status' => 'Approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $what = self::label($editRequest->type);
        ActivityLog::notifyUser($editRequest->requested_by, "Your {$what} for donor {$editRequest->donor_name} was approved by {$request->user()->name} ({$request->user()->role}).", self::category($editRequest->type));
        AuditLog::record($request->user()->id, 'edit_request_approved', "Approved {$what} from {$editRequest->requester?->name} for donor {$editRequest->donor_name}.");

        return response()->json(['request' => $editRequest->fresh(['requester', 'reviewer'])->toFrontendArray()]);
    }

    public function changeInfo(Request $request, EditRequest $editRequest)
    {
        if (!in_array($editRequest->type, ['donor_create', 'donor_edit', 'history_record'], true) || $editRequest->status !== 'Pending') {
            return response()->json(['message' => 'Only a pending request can be changed.'], 422);
        }

        $data = $request->validate([
            'payload' => 'required|array',
        ]);

        $old = $editRequest->payload ?? [];
        if ($editRequest->type === 'history_record') {
            $allowed = ['name', 'location', 'bloodType', 'priorLastDonation', 'newDonation', 'timesDonated', 'amount'];
        } elseif ($editRequest->type === 'donor_edit') {
            $allowed = array_values(array_filter(array_keys($old), fn ($k) => $k !== '_fieldLabels'));
        } else {
            $allowed = ['name', 'bloodType', 'sex', 'bday', 'contact', 'brgy', 'venue', 'weight', 'bp', 'height', 'eligibilityStatus', 'allergies', 'medicalConditions', 'deferralReason', 'emergencyContactName', 'emergencyContactNumber', 'hemoglobin'];
        }
        $incoming = array_intersect_key($data['payload'], array_flip($allowed));
        $parts = ChangeDiff::between($old, $incoming, array_keys($incoming));

        if (!$parts) {
            return response()->json(['message' => 'No changes were made.'], 422);
        }

        $payload = array_merge($old, $incoming);
        $editRequest->payload = $payload;
        if (!empty($payload['name']) && $editRequest->type !== 'donor_edit') {
            $editRequest->donor_name = $payload['name'];
        }
        $editRequest->save();

        AuditLog::recordDonorAction($request->user()->id, 'Update', null, $editRequest->donor_name, ChangeDiff::format($parts));

        return response()->json(['request' => $editRequest->fresh(['requester', 'reviewer'])->toFrontendArray()]);
    }

    public function reject(Request $request, EditRequest $editRequest)
    {
        if ($editRequest->status !== 'Pending') {
            return response()->json(['message' => 'This request was already reviewed.'], 422);
        }

        $editRequest->update([
            'status' => 'Rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $what = self::label($editRequest->type);
        ActivityLog::notifyUser($editRequest->requested_by, "Your {$what} for donor {$editRequest->donor_name} was rejected by {$request->user()->name} ({$request->user()->role}).", self::category($editRequest->type));
        AuditLog::record($request->user()->id, 'edit_request_rejected', "Rejected {$what} from {$editRequest->requester?->name} for donor {$editRequest->donor_name}.");

        return response()->json(['request' => $editRequest->fresh(['requester', 'reviewer'])->toFrontendArray()]);
    }

    public function destroy(Request $request, EditRequest $editRequest)
    {
        $user = $request->user();
        if (!$user->canManageInventory()) {
            abort_unless($editRequest->requested_by === $user->id, 403, 'Not your request.');
            abort_if($editRequest->status === 'Pending', 422, 'A Pending request cannot be deleted yet.');
            $editRequest->update(['hidden_by_requester' => true]);
            return response()->json(['ok' => true]);
        }
        $label = self::label($editRequest->type) . " from {$editRequest->requester?->name} for donor {$editRequest->donor_name}";
        $status = $editRequest->status;
        $editRequest->delete();
        AuditLog::record($request->user()->id, 'edit_request_deleted', "Deleted {$status} {$label}.");

        return response()->json(['ok' => true]);
    }

    public function destroyMany(Request $request)
    {
        abort_unless($request->user()->canManageInventory(), 403);
        $data = $request->validate([
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'integer',
        ]);

        $items = EditRequest::whereIn('id', $data['ids'])->get();
        foreach ($items as $item) {
            $label = self::label($item->type) . " for donor {$item->donor_name}";
            $status = $item->status;
            $item->delete();
            AuditLog::record($request->user()->id, 'edit_request_deleted', "Deleted {$status} {$label}.");
        }

        return response()->json(['deleted' => $items->count()]);
    }

    public function destroyByStatus(Request $request, string $status)
    {
        abort_unless(in_array($status, ['Approved', 'Rejected'], true), 422, 'Only Approved or Rejected requests can be deleted in bulk.');
        $user = $request->user();
        if (!$user->canManageInventory()) {
            $n = EditRequest::where('requested_by', $user->id)->where('status', $status)->update(['hidden_by_requester' => true]);
            return response()->json(['deleted' => $n]);
        }
        $n = EditRequest::where('status', $status)->count();
        EditRequest::where('status', $status)->delete();
        AuditLog::record($request->user()->id, 'edit_request_deleted', "Deleted all {$n} {$status} requests.");

        return response()->json(['deleted' => $n]);
    }

    private function applyDonorEdit(EditRequest $req, Request $request): void
    {
        $donor = Donor::find($req->donor_id);
        if (!$donor) {
            abort(422, 'The donor no longer exists.');
        }

        $changes = $req->payload ?? [];
        unset($changes['_fieldLabels']);
        $snapshot = $donor->toFrontendArray();

        $attrs = [];
        foreach (self::COLUMN_MAP as $key => $col) {
            if (array_key_exists($key, $changes)) {
                $attrs[$col] = $changes[$key];
            }
        }
        if (array_key_exists('sex', $changes)) {
            $attrs['gender'] = $changes['sex'];
            $changes['gender'] = $changes['sex'];
        }
        if (array_key_exists('bday', $changes) && $changes['bday']) {
            $attrs['dob'] = $changes['bday'];
        }
        $attrs['extra'] = array_merge($donor->extra ?? [], $changes);
        $donor->update($attrs);

        $rec = MonitoringRecord::where('donor_id', $donor->id)->first();
        if ($rec) {
            $extra = $rec->extra ?? [];
            if (isset($changes['name'])) { $extra['name'] = $changes['name']; }
            if (isset($changes['brgy'])) { $extra['location'] = $changes['brgy'] . ', Irosin, Sorsogon, Bicol, Philippines'; }
            if (isset($changes['bloodType'])) { $extra['bloodType'] = $changes['bloodType']; $rec->blood_type = $changes['bloodType']; }
            $rec->extra = $extra;
            $rec->save();
        }

        $details = ChangeDiff::format(ChangeDiff::between($snapshot, $donor->fresh()->toFrontendArray()));
        if ($details !== '') {
            AuditLog::recordDonorAction($request->user()?->id, 'Update', $donor->id, $donor->name,
                $details . "\n(approved request of " . ($req->requester?->name ?? 'Staff') . ')');
        }
    }

    private function applyDonorCreate(EditRequest $req, Request $request): void
    {
        $payload = $req->payload ?? [];
        unset($payload['_fieldLabels']);
        $payload['createdBy'] = $req->requester?->name ?? ($payload['createdBy'] ?? 'Staff');
        $payload['createdAt'] = optional($req->created_at)->toIso8601String();
        $payload['approvedBy'] = $request->user()?->name;
        $payload['approvedAt'] = now()->toIso8601String();
        $payload['status'] = 'Approved';
        $donor = DonorController::createFromPayload($payload);
        $req->donor_id = $donor->id;
        $req->save();

        // History Records created while this donor was still in Donor Screening: link them to the new donor.
        $linked = MonitoringRecord::whereNull('donor_id')->get()->filter(function ($rec) use ($req, $donor) {
            $x = $rec->extra ?? [];
            return (string) ($x['pendingDonorRequestId'] ?? '') === (string) $req->id
                || (empty($x['pendingDonorRequestId']) && mb_strtolower(trim((string) ($x['name'] ?? ''))) === mb_strtolower(trim((string) $donor->name)));
        });
        foreach ($linked as $rec) {
            $x = $rec->extra ?? [];
            unset($x['pendingDonorRequestId']);
            $rec->update(['donor_id' => $donor->id, 'extra' => $x]);
            $rec->syncTransactions();
            $dx = $donor->extra ?? [];
            $dx['lastDonation'] = $x['donationDate'] ?? ($dx['lastDonation'] ?? 'N/A');
            $dx['timesDonated'] = $x['timesDonated'] ?? ($dx['timesDonated'] ?? 0);
            $donor->update(['extra' => $dx]);
        }

        $venue = trim((string) ($payload['venue'] ?? ''));
        AuditLog::recordDonorAction($request->user()?->id, 'Create', $donor->id, $donor->name,
            'New donor approved' . ($venue !== '' ? " — Venue: {$venue}" : '') . '.', $req->requester);
    }

    private static function label(string $type): string
    {
        return ['donor_edit' => 'edit request', 'donor_create' => 'new donor', 'history_record' => 'History Record'][$type] ?? 'request';
    }

    private static function category(string $type): string
    {
        return ['donor_edit' => 'edit_request', 'donor_create' => 'donor_pending', 'history_record' => 'record_pending'][$type] ?? 'edit_request';
    }
}
