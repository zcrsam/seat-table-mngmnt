<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Venue;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Venue::create([
            'name' => 'Alabang Function Room',
            'wing' => 'Main Wing',
            'type' => 'function_room',
            'capacity' => 100,
            'price_per_hour' => 5000.00,
            'description' => 'Elegant function room perfect for corporate events and special occasions.',
            'image' => 'afc.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => 'Laguna Ballroom',
            'wing' => 'Main Wing',
            'type' => 'function_room',
            'capacity' => 200,
            'price_per_hour' => 8000.00,
            'description' => 'Spacious ballroom with panoramic views of Laguna Bay.',
            'image' => 'laguna.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => '20/20 Function Room',
            'wing' => 'Main Wing',
            'type' => 'function_room',
            'capacity' => 50,
            'price_per_hour' => 3000.00,
            'description' => 'Intimate setting for smaller gatherings and meetings.',
            'image' => '20-20.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => 'Business Center',
            'wing' => 'Main Wing',
            'type' => 'function_room',
            'capacity' => 30,
            'price_per_hour' => 2000.00,
            'description' => 'Professional space for business meetings and conferences.',
            'image' => 'bc.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => 'Tower Ballroom',
            'wing' => 'Tower Wing',
            'type' => 'function_room',
            'capacity' => 300,
            'price_per_hour' => 12000.00,
            'description' => 'Grand ballroom on tower level with city views.',
            'image' => 'towerb.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => 'Qsina Restaurant',
            'wing' => 'Dining',
            'type' => 'dining',
            'capacity' => 80,
            'price_per_hour' => 0.00,
            'description' => 'Fine dining restaurant serving international cuisine.',
            'image' => 'qsina.jpeg',
            'is_active' => 1,
        ]);

        Venue::create([
            'name' => 'Hanakazu Japanese Restaurant',
            'wing' => 'Dining',
            'type' => 'dining',
            'capacity' => 60,
            'price_per_hour' => 0.00,
            'description' => 'Authentic Japanese restaurant with teppanyaki stations.',
            'image' => 'hanakazu.jpeg',
            'is_active' => 1,
        ]);
    }
}
