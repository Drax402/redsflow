<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('audit_log')
            ->where('action_label', 'Edit')
            ->update(['action_label' => 'Update']);

        DB::table('audit_log')
            ->where('action', 'edit_donor_record')
            ->update(['action' => 'update_donor_record']);
    }

    public function down(): void
    {
    }
};
