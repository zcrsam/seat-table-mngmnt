<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'name' => 'The Bellevue Manila Admin',
            'email' => 'bellevue@admin.com',
            'username' => 'bellevue@admin.com',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
        ]);

        Admin::create([
            'name' => 'Venue Manager',
            'email' => 'manager@bellevue.com',
            'username' => 'manager',
            'password' => Hash::make('manager123'),
            'role' => 'venue_manager',
        ]);
    }
}
