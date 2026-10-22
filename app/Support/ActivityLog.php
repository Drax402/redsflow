<?php

namespace App\Support;

use App\Models\AppNotification;
use App\Models\StaffProfile;
use App\Models\User;
use App\Models\UserLog;
use Illuminate\Support\Facades\Log;

class ActivityLog
{
    public static function userEvent(?int $userId, string $event, ?string $ip = null): void
    {
        if (!$userId) {
            return;
        }

        try {
            UserLog::create([
                'user_id' => $userId,
                'event' => $event,
                'occurred_at' => now(),
                'ip_address' => $ip,
            ]);
        } catch (\Throwable $e) {
            Log::warning('user_logs write failed: ' . $e->getMessage());
        }
    }

    public static function notifyUser(?int $userId, string $message, string $category = 'other'): void
    {
        if (!$userId) {
            return;
        }

        try {
            AppNotification::create(['user_id' => $userId, 'message' => $message, 'category' => $category]);
        } catch (\Throwable $e) {
            Log::warning('notification write failed: ' . $e->getMessage());
        }
    }

    public static function notifyAdmins(string $message, ?int $exceptUserId = null, string $category = 'other'): void
    {
        try {
            $roles = in_array($category, ['donor_pending', 'record_pending'], true) ? ['Admin', User::ROLE_MEDTECH] : ['Admin'];
            $ids = User::whereIn('role', $roles)
                ->where('status', 'Approved')
                ->when($exceptUserId, fn ($q) => $q->where('id', '!=', $exceptUserId))
                ->pluck('id');

            foreach ($ids as $id) {
                AppNotification::create(['user_id' => $id, 'message' => $message, 'category' => $category]);
            }
        } catch (\Throwable $e) {
            Log::warning('admin notification write failed: ' . $e->getMessage());
        }
    }

    public static function staffActivity(?User $actor, string $what, string $category = 'other'): void
    {
        if (!$actor || !in_array($actor->role, ['Staff', User::ROLE_MEDTECH], true)) {
            return;
        }
        if (in_array($category, ['create_donor', 'update_donor', 'update_record'], true)) {
            return;
        }

        self::notifyAdmins("{$actor->name} (Staff) {$what}.", $actor->id, $category);
    }

    public static function syncStaffProfile(User $user): void
    {
        try {
            StaffProfile::updateOrCreate(
                ['user_id' => $user->id],
                ['extra' => [
                    'email' => $user->email,
                    'contact' => $user->contact,
                    'sex' => $user->gender,
                    'username' => $user->username,
                    'bday' => optional($user->dob)->toDateString(),
                    'address' => $user->brgy,
                    'role' => $user->role,
                    'status' => $user->status,
                    'synced_at' => now()->toDateTimeString(),
                ]]
            );
        } catch (\Throwable $e) {
            Log::warning('staff_profiles write failed: ' . $e->getMessage());
        }
    }
}
