<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username', 40)->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('users', 'is_disabled')) {
                $table->boolean('is_disabled')->default(false);
            }
            if (!Schema::hasColumn('users', 'disabled_at')) {
                $table->timestamp('disabled_at')->nullable();
            }
            if (!Schema::hasColumn('users', 'disabled_by')) {
                $table->unsignedBigInteger('disabled_by')->nullable();
            }
        });

        foreach (DB::table('users')->whereNull('username')->get() as $u) {
            $base = Str::of((string) $u->name)->lower()->ascii()->replaceMatches('/[^a-z0-9]+/', '.')->trim('.')->limit(24, '')->toString();
            if ($base === '') {
                $base = 'user';
            }
            $candidate = $base;
            $i = 1;
            while (DB::table('users')->where('username', $candidate)->exists()) {
                $candidate = $base . $i++;
            }
            DB::table('users')->where('id', $u->id)->update(['username' => $candidate]);
        }

        DB::table('users')->where('role', 'Admin')->whereNull('contact')->update(['contact' => '09000000000']);
        DB::table('users')->where('role', 'Admin')->whereNull('gender')->update(['gender' => 'Male']);
        DB::table('users')->where('role', 'Admin')->whereNull('brgy')->update(['brgy' => 'Bagsangan']);
        DB::table('users')->where('role', 'Admin')->whereNull('dob')->update(['dob' => '1990-01-01']);

        Schema::table('app_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('app_notifications', 'category')) {
                $table->string('category', 30)->default('other')->after('message');
            }
        });
        $map = [
            'login' => ['Your account (%) was logged in and used.%', 'Security alert%'],
            'staff_account' => ['New Staff sign-up request%', 'Good news! Your Staff account%'],
            'create_donor' => ['%(Staff) added a new donor%'],
            'update_donor' => ['%(Staff) updated a donor profile%', '%(Staff) deleted % donor%'],
            'update_record' => ['%History Record%'],
            'password' => ['Your password was%', 'Your account email address was changed.%'],
        ];
        foreach ($map as $cat => $patterns) {
            foreach ($patterns as $p) {
                DB::table('app_notifications')->where('category', 'other')->where('message', 'like', $p)->update(['category' => $cat]);
            }
        }

        if (!Schema::hasTable('edit_requests')) {
            Schema::create('edit_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
                $table->string('type', 30);
                $table->unsignedBigInteger('donor_id')->nullable();
                $table->text('donor_name')->nullable();
                $table->longText('payload')->nullable();
                $table->longText('original')->nullable();
                $table->text('reason')->nullable();
                $table->string('status', 20)->default('Pending');
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
                $table->index(['status', 'type']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('edit_requests');
        Schema::table('app_notifications', function (Blueprint $table) {
            if (Schema::hasColumn('app_notifications', 'category')) {
                $table->dropColumn('category');
            }
        });
        Schema::table('users', function (Blueprint $table) {
            foreach (['username', 'is_disabled', 'disabled_at', 'disabled_by'] as $c) {
                if (Schema::hasColumn('users', $c)) {
                    if ($c === 'username') { $table->dropUnique(['username']); }
                    $table->dropColumn($c);
                }
            }
        });
    }
};
