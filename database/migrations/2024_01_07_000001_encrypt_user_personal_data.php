<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $targets = [
        'users' => ['name', 'ext_name', 'contact', 'brgy', 'gender', 'dob'],
        'donors' => ['brgy', 'gender', 'dob'],
        'app_notifications' => ['message'],
    ];

    private function isEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);
            return true;
        } catch (DecryptException $e) {
            return false;
        }
    }

    /** MySQL cannot keep a normal index on a TEXT column, so drop any index on it first. */
    private function dropIndexesOn(string $table, string $column): void
    {
        $rows = DB::select(
            "SELECT DISTINCT INDEX_NAME AS idx FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND INDEX_NAME <> 'PRIMARY'",
            [$table, $column]
        );
        foreach ($rows as $row) {
            try {
                DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$row->idx}`");
            } catch (\Throwable $e) {
            }
        }
    }

    public function up(): void
    {
        $driver = DB::getDriverName();

        foreach ($this->targets as $table => $columns) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            $columns = array_values(array_filter($columns, fn ($c) => Schema::hasColumn($table, $c)));

            foreach ($columns as $column) {
                if (in_array($driver, ['mysql', 'mariadb'])) {
                    $this->dropIndexesOn($table, $column);
                    $null = ($table === 'users' && $column === 'name') || ($table === 'app_notifications') ? 'NOT NULL' : 'NULL';
                    DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` TEXT {$null}");
                } elseif ($driver === 'pgsql') {
                    DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE TEXT USING \"{$column}\"::text");
                }
            }

            DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns) {
                foreach ($rows as $row) {
                    $update = [];
                    foreach ($columns as $column) {
                        $value = $row->{$column};
                        if ($value === null || $value === '') {
                            continue;
                        }
                        $value = (string) $value;
                        if (!$this->isEncrypted($value)) {
                            $update[$column] = Crypt::encryptString($value);
                        }
                    }
                    if ($update) {
                        DB::table($table)->where('id', $row->id)->update($update);
                    }
                }
            });
        }
    }

    public function down(): void
    {
    }
};
