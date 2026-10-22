<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('blood_bags')) {
            return;
        }

        Schema::create('blood_bags', function (Blueprint $table) {
            $table->id();
            $table->string('bag_uid', 40)->unique();
            $table->string('bag_code', 40)->unique();
            $table->string('blood_center', 120)->nullable();
            $table->foreignId('donor_id')->nullable()->constrained('donors')->nullOnDelete();
            $table->text('donor_name')->nullable();
            $table->text('blood_type')->nullable();
            $table->string('component', 20);
            $table->unsignedTinyInteger('units')->default(1);
            $table->date('collected_on');
            $table->date('expires_on');
            $table->string('result', 20)->default('Usable');
            $table->string('storage_location', 60)->nullable();
            $table->string('shelf', 40)->nullable();
            $table->string('status', 20)->default('In Stock');
            $table->unsignedTinyInteger('alerted_level')->default(0);
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'expires_on']);
            $table->index('collected_on');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_bags');
    }
};
