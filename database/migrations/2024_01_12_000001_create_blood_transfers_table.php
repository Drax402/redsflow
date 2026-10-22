<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('blood_transfers')) {
            return;
        }

        Schema::create('blood_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 12);
            $table->unsignedBigInteger('blood_bag_id')->nullable();
            $table->string('bag_code', 40)->nullable();
            $table->string('component', 30)->nullable();
            $table->text('blood_type')->nullable();
            $table->string('destination', 150)->nullable();
            $table->text('patient_name')->nullable();
            $table->string('reason', 160)->nullable();
            $table->text('remarks')->nullable();
            $table->date('transferred_on');
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->string('recorded_by_name', 120)->nullable();
            $table->timestamps();
            $table->index(['kind', 'transferred_on']);
            $table->index('blood_bag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_transfers');
    }
};
