<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DbCheck extends Command
{
    protected $signature = 'redflow:db-check';
    protected $description = 'Show row counts for every REDFLOW table and check that personal data is encrypted';

    public function handle(): int
    {
        $connectionName = config('database.default');
        $driver = config("database.connections.{$connectionName}.driver");
        $this->line("Database connection: <fg=cyan>{$connectionName}</> (driver: <fg=cyan>{$driver}</>)");
        if ($driver === 'sqlite') {
            $this->warn('WARNING: this app is using SQLite. On Railway, SQLite is stored on the');
            $this->warn('container disk, which is WIPED on every redeploy/restart — so ALL data');
            $this->warn('(not just one table) resets to empty each time. Add a MySQL database on');
            $this->warn('Railway and set DB_CONNECTION=mysql (see RAILWAY-SETUP.md, section 6).');
        } else {
            try {
                DB::connection()->getPdo();
                $this->info('Connected successfully.');
            } catch (\Throwable $e) {
                $this->error('Could NOT connect to the database: ' . $e->getMessage());
                $this->error('Fix the DB_* variables first — the checks below will all show 0 / MISSING until this works.');
            }
        }
        $this->line('');

        $tables = [
            'users' => 'Staff / Admin accounts',
            'staff_profiles' => 'Account profile details',
            'donors' => 'Donor Masterlist',
            'monitoring_records' => 'History Records',
            'monitoring_transactions' => 'Past donations',
            'app_notifications' => 'Notifications',
            'audit_log' => 'Audit Log (ALL rows — see breakdown below)',
            'user_logs' => 'User login/logout events',
            'password_reset_otps' => 'Forgot-password codes',
            'secure_files' => 'ID / selfie photos (encrypted)',
        ];

        $rows = [];
        foreach ($tables as $table => $label) {
            $rows[] = Schema::hasTable($table)
                ? [$table, $label, DB::table($table)->count()]
                : [$table, $label, 'MISSING — run: php artisan migrate --force'];
        }
        $this->table(['Table', 'What it holds', 'Rows'], $rows);

        if (Schema::hasTable('audit_log')) {
            $shown = DB::table('audit_log')->whereNotNull('action_label')->count();
            $security = DB::table('audit_log')->whereNull('action_label')->count();
            $this->line('');
            $this->line('Audit Log breakdown:');
            $this->line("  Shown on the Audit Log page (Create/Update/Delete/Export/Change): {$shown}");
            $this->line("  Security events not shown there (login/logout/register/etc.):    {$security}");
            $this->line('  "Clear Audit Log" / "Delete selected" only remove the first group.');
        }

        $this->line('');
        $this->line('Encryption check (columns that must NOT be readable):');
        $checks = [
            ['donors', 'name'], ['donors', 'contact'], ['donors', 'blood_type'], ['donors', 'extra'],
            ['monitoring_records', 'blood_type'], ['monitoring_records', 'extra'],
            ['audit_log', 'donor_name'], ['audit_log', 'details'],
        ];
        foreach ($checks as [$table, $column]) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, $column)) {
                continue;
            }
            $total = DB::table($table)->whereNotNull($column)->where($column, '!=', '')->count();
            $plain = 0;
            DB::table($table)->whereNotNull($column)->where($column, '!=', '')->orderBy('id')
                ->chunkById(200, function ($chunk) use ($column, &$plain) {
                    foreach ($chunk as $row) {
                        try {
                            Crypt::decryptString($row->{$column});
                        } catch (\Throwable $e) {
                            $plain++;
                        }
                    }
                });
            $this->line(sprintf('  %-26s %s', "{$table}.{$column}",
                $total === 0 ? '(no data yet)' : ($plain === 0 ? "OK — all {$total} encrypted" : "{$plain} of {$total} NOT encrypted — run: php artisan migrate --force")));
        }

        return self::SUCCESS;
    }
}
