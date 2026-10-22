<?php

use App\Models\MonitoringRecord;
use App\Models\User;
use App\Support\ActivityLog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('staff_profiles') && Schema::hasTable('users')) {
            User::orderBy('id')->chunkById(200, function ($users) {
                foreach ($users as $user) {
                    ActivityLog::syncStaffProfile($user);
                }
            });
        }

        if (Schema::hasTable('monitoring_transactions') && Schema::hasTable('monitoring_records')) {
            MonitoringRecord::orderBy('id')->chunkById(200, function ($records) {
                foreach ($records as $record) {
                    $record->syncTransactions();
                }
            });
        }
    }

    public function down(): void
    {
    }
};
