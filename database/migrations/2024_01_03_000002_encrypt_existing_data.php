<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function isEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);
            return true;
        } catch (DecryptException $e) {
            return false;
        }
    }

    private function encryptColumns(string $table, array $columns): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }
        $columns = array_values(array_filter($columns, fn ($c) => Schema::hasColumn($table, $c)));
        if (!$columns) {
            return;
        }

        DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns) {
            foreach ($rows as $row) {
                $update = [];
                foreach ($columns as $column) {
                    $value = $row->{$column};
                    if ($value === null || $value === '') {
                        continue;
                    }
                    if (!is_string($value)) {
                        $value = (string) $value;
                    }
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

    public function up(): void
    {
        $this->encryptColumns('donors', ['name', 'ext_name', 'blood_type', 'contact', 'extra']);
        $this->encryptColumns('monitoring_records', ['blood_type', 'extra']);
        $this->encryptColumns('monitoring_transactions', ['blood_type', 'extra']);
        $this->encryptColumns('audit_log', ['donor_name', 'details']);
        $this->encryptColumns('staff_profiles', ['extra']);
    }

    public function down(): void
    {
    }
};
