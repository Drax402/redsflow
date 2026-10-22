<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'role')) {
            return;
        }

        DB::table('users')->where('role', 'Blood Bank MedTech')->update(['role' => 'Staff']);

        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE `users` MODIFY `role` ENUM('Admin','Staff') NOT NULL DEFAULT 'Staff'");
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'role')) {
            return;
        }

        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE `users` MODIFY `role` ENUM('Admin','Staff','Blood Bank MedTech') NOT NULL DEFAULT 'Staff'");
        }
    }
};
