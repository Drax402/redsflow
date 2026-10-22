<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('blood_bags') || !Schema::hasTable('blood_transfers')) {
            return;
        }

        $ids = DB::table('blood_transfers')->where('kind', 'patient')->whereNotNull('blood_bag_id')->pluck('blood_bag_id');
        if ($ids->isNotEmpty()) {
            DB::table('blood_bags')->whereIn('id', $ids)->where('status', 'Transferred')->update(['status' => 'Released']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('blood_bags')) {
            DB::table('blood_bags')->where('status', 'Released')->update(['status' => 'Transferred']);
        }
    }
};
