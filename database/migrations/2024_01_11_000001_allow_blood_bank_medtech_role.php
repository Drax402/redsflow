<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'role')) {
            return;
        }

        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE `users` MODIFY `role` ENUM('Admin','Staff','Blood Bank MedTech') NOT NULL DEFAULT 'Staff'");
            return;
        }

        try {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 40)->default('Staff')->change();
            });
        } catch (\Throwable $e) {
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'role')) {
            return;
        }

        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::table('users')->where('role', 'Blood Bank MedTech')->update(['role' => 'Staff']);
            DB::statement("ALTER TABLE `users` MODIFY `role` ENUM('Admin','Staff') NOT NULL DEFAULT 'Staff'");
        }
    }
};
