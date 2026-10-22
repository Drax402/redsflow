<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('storage_units')) {
            Schema::create('storage_units', function (Blueprint $table) {
                $table->id();
                $table->string('name', 60)->unique();
                $table->string('temperature', 40);
                $table->string('kind', 12);
                $table->timestamps();
            });

            $now = now();
            DB::table('storage_units')->insert([
                ['name' => 'Refrigerator 1', 'temperature' => '2-6 C', 'kind' => 'fridge', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'Refrigerator 2', 'temperature' => '2-6 C', 'kind' => 'fridge', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'Platelet Agitator 1', 'temperature' => '20-24 C', 'kind' => 'agitator', 'created_at' => $now, 'updated_at' => $now],
                ['name' => 'Freezer 1', 'temperature' => '-18 C or colder', 'kind' => 'freezer', 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        if (Schema::hasTable('blood_bags') && !Schema::hasColumn('blood_bags', 'storage_unit_id')) {
            Schema::table('blood_bags', function (Blueprint $table) {
                $table->foreignId('storage_unit_id')->nullable()->after('storage_location')->constrained('storage_units')->nullOnDelete();
            });

            foreach (DB::table('storage_units')->get() as $unit) {
                DB::table('blood_bags')
                    ->where('storage_location', 'like', $unit->name . ' (%')
                    ->update(['storage_unit_id' => $unit->id, 'storage_location' => null]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('blood_bags', 'storage_unit_id')) {
            Schema::table('blood_bags', function (Blueprint $table) {
                $table->dropConstrainedForeignId('storage_unit_id');
            });
        }
        Schema::dropIfExists('storage_units');
    }
};
