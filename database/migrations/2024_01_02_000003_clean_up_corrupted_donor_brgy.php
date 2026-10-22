<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $donors = DB::table('donors')->whereNotNull('brgy')->where('brgy', 'like', '%,%')->get(['id', 'brgy']);
        foreach ($donors as $donor) {
            $clean = trim(explode(',', $donor->brgy)[0]);
            DB::table('donors')->where('id', $donor->id)->update(['brgy' => $clean]);
        }
    }

    public function down(): void
    {
    }
};
