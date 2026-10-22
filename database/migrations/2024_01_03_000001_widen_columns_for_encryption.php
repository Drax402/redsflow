<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'])) {
            foreach (['donors_name_index', 'donors_blood_type_index', 'donors_brgy_index'] as $index) {
                try {
                    DB::statement('ALTER TABLE donors DROP INDEX ' . $index);
                } catch (\Throwable $e) {
                }
            }
        } else {
            DB::statement('DROP INDEX IF EXISTS donors_name_index');
            DB::statement('DROP INDEX IF EXISTS donors_blood_type_index');
            DB::statement('DROP INDEX IF EXISTS donors_brgy_index');
        }

        $text = [
            'donors' => ['name' => false, 'ext_name' => true, 'blood_type' => true, 'contact' => true],
            'monitoring_records' => ['blood_type' => true],
            'monitoring_transactions' => ['blood_type' => true],
            'audit_log' => ['donor_name' => true],
        ];
        $json = [
            'donors' => 'extra',
            'monitoring_records' => 'extra',
            'monitoring_transactions' => 'extra',
            'staff_profiles' => 'extra',
        ];

        foreach ($text as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach ($columns as $column => $nullable) {
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }
                $null = $nullable ? 'NULL' : 'NOT NULL';
                if (in_array($driver, ['mysql', 'mariadb'])) {
                    DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` TEXT {$null}");
                } elseif ($driver === 'pgsql') {
                    DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE TEXT");
                }
            }
        }

        foreach ($json as $table => $column) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, $column)) {
                continue;
            }
            if (in_array($driver, ['mysql', 'mariadb'])) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` LONGTEXT NULL");
            } elseif ($driver === 'pgsql') {
                DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE TEXT USING \"{$column}\"::text");
            }
        }
    }

    public function down(): void
    {
    }
};
