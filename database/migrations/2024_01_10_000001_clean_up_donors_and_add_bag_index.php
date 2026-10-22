<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('donors')) {
            foreach (['ext_name', 'avatar_path'] as $col) {
                if (Schema::hasColumn('donors', $col)) {
                    Schema::table('donors', function (Blueprint $table) use ($col) {
                        $table->dropColumn($col);
                    });
                }
            }
        }

        if (Schema::hasTable('blood_bags') && Schema::hasColumn('blood_bags', 'storage_unit_id')) {
            try {
                Schema::table('blood_bags', function (Blueprint $table) {
                    $table->index(['storage_unit_id', 'status'], 'blood_bags_unit_status_index');
                });
            } catch (\Throwable $e) {
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('donors')) {
            Schema::table('donors', function (Blueprint $table) {
                if (!Schema::hasColumn('donors', 'ext_name')) {
                    $table->string('ext_name')->nullable()->after('name');
                }
                if (!Schema::hasColumn('donors', 'avatar_path')) {
                    $table->string('avatar_path')->nullable()->after('dob');
                }
            });
        }
        if (Schema::hasTable('blood_bags')) {
            try {
                Schema::table('blood_bags', function (Blueprint $table) {
                    $table->dropIndex('blood_bags_unit_status_index');
                });
            } catch (\Throwable $e) {
            }
        }
    }
};
