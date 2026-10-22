<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->index('name');
            $table->index('blood_type');
            $table->index('brgy');
        });

        Schema::table('monitoring_records', function (Blueprint $table) {
            $table->index('donation_date');
        });

        Schema::table('audit_log', function (Blueprint $table) {
            $table->index('logged_at');
        });

        Schema::table('user_logs', function (Blueprint $table) {
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['blood_type']);
            $table->dropIndex(['brgy']);
        });
        Schema::table('monitoring_records', function (Blueprint $table) {
            $table->dropIndex(['donation_date']);
        });
        Schema::table('audit_log', function (Blueprint $table) {
            $table->dropIndex(['logged_at']);
        });
        Schema::table('user_logs', function (Blueprint $table) {
            $table->dropIndex(['occurred_at']);
        });
    }
};
