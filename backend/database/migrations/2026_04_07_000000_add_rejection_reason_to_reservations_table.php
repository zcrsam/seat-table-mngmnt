<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('reservations') || Schema::hasColumn('reservations', 'rejection_reason')) {
            return;
        }

        Schema::table('reservations', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('special_requests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('reservations') || !Schema::hasColumn('reservations', 'rejection_reason')) {
            return;
        }

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
