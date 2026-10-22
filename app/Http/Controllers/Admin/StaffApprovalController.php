<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class StaffApprovalController extends Controller
{
    public function approve(Request $request, string $uuid)
    {
        $staff = User::where('uuid', $uuid)->whereIn('role', ['Staff', User::ROLE_MEDTECH])->firstOrFail();
        $staff->status = 'Approved';
        $staff->action_taken = 'Approved';
        if (Schema::hasColumn('users', 'approved_by')) {
            $staff->approved_by = $request->user()?->id;
        }
        if (Schema::hasColumn('users', 'approved_at')) {
            $staff->approved_at = now();
        }
        $staff->save();

        AppNotification::create([
            'user_id' => $staff->id,
            'message' => 'Good news! Your Staff account has been approved by the Admin. You can now log in and start using REDFLOW.',
            'category' => 'staff_account',
        ]);

        ActivityLog::userEvent($staff->id, 'approved', $request->ip());
        ActivityLog::syncStaffProfile($staff);

        AuditLog::record($request->user()?->id, 'approve_staff', "Approved staff account: {$staff->name} ({$staff->email}).");

        return response()->json(['user' => $staff->toFrontendArray()]);
    }

    public function reject(Request $request, string $uuid)
    {
        $staff = User::where('uuid', $uuid)->whereIn('role', ['Staff', User::ROLE_MEDTECH])->firstOrFail();
        $name = $staff->name;
        $email = $staff->email;
        $staff->delete();

        AuditLog::record($request->user()?->id, 'reject_staff', "Rejected staff sign-up request: {$name} ({$email}).");

        return response()->json(['message' => 'Rejected.']);
    }

    public function disable(Request $request, string $uuid)
    {
        $staff = User::where('uuid', $uuid)->whereIn('role', ['Staff', User::ROLE_MEDTECH])->firstOrFail();
        $staff->is_disabled = true;
        $staff->disabled_at = now();
        $staff->disabled_by = $request->user()?->id;
        $staff->action_taken = 'Disabled';
        $staff->save();

        ActivityLog::userEvent($staff->id, 'account_disabled', $request->ip());
        AuditLog::record($request->user()?->id, 'disable_staff', "Disabled staff account: {$staff->name} ({$staff->email}) by {$request->user()?->name}.");

        return response()->json(['user' => $staff->toFrontendArray()]);
    }

    public function enable(Request $request, string $uuid)
    {
        $staff = User::where('uuid', $uuid)->whereIn('role', ['Staff', User::ROLE_MEDTECH])->firstOrFail();
        $staff->is_disabled = false;
        $staff->disabled_at = null;
        $staff->disabled_by = null;
        $staff->action_taken = 'Enabled';
        $staff->save();

        ActivityLog::userEvent($staff->id, 'account_enabled', $request->ip());
        AuditLog::record($request->user()?->id, 'enable_staff', "Enabled staff account: {$staff->name} ({$staff->email}) by {$request->user()?->name}.");

        return response()->json(['user' => $staff->toFrontendArray()]);
    }
}
