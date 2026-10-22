<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edit_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('edit_requests', 'hidden_by_requester')) {
                $table->boolean('hidden_by_requester')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('edit_requests', function (Blueprint $table) {
            if (Schema::hasColumn('edit_requests', 'hidden_by_requester')) {
                $table->dropColumn('hidden_by_requester');
            }
        });
    }
};
