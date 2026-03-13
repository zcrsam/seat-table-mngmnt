<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update admin credentials to bellevue@admin.com / admin123
        DB::table('admins')
            ->where('username', 'admin')
            ->update([
                'username' => 'bellevue@admin.com',
                'email' => 'bellevue@admin.com',
                'password' => bcrypt('admin123'),
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original admin credentials
        DB::table('admins')
            ->where('username', 'bellevue@admin.com')
            ->update([
                'username' => 'admin',
                'email' => 'admin@bellevue.com',
                'password' => bcrypt('admin123'),
                'updated_at' => now(),
            ]);
    }
};
