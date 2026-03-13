<?php

namespace App\Services;

use App\Models\Venue;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class VenueService
{
    /**
     * Get all venues without pagination (for index page)
     */
    public function getAllVenues(): array
    {
        return Venue::all()->map(function($venue) {
            return [
                'id' => $venue->id,
                'name' => $venue->name,
                'wing' => $venue->wing,
                'type' => $venue->type,
                'capacity' => $venue->capacity,
                'price_per_hour' => $venue->price_per_hour,
                'description' => $venue->description,
                'image' => $venue->image,
                'is_active' => $venue->is_active,
                'created_at' => $venue->created_at,
                'updated_at' => $venue->updated_at,
            ];
        })->toArray();
    }

    /**
     * Get paginated venues
     */
    public function getPaginatedVenues(int $perPage = 10, int $page = 1): LengthAwarePaginator
    {
        return Venue::paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get venue by ID with relationships
     */
    public function getVenueById(int $id): ?Venue
    {
        return Venue::with(['seats', 'reservations'])->find($id);
    }

    /**
     * Create new venue
     */
    public function createVenue(array $data): Venue
    {
        return Venue::create($data);
    }

    /**
     * Update venue
     */
    public function updateVenue(int $id, array $data): ?Venue
    {
        $venue = Venue::find($id);
        if (!$venue) {
            return null;
        }
        
        $venue->update($data);
        return $venue;
    }

    /**
     * Delete venue
     */
    public function deleteVenue(int $id): bool
    {
        $venue = Venue::find($id);
        if (!$venue) {
            return false;
        }
        
        return $venue->delete();
    }

    /**
     * Get venues by wing
     */
    public function getVenuesByWing(string $wing): array
    {
        return Venue::where('wing', $wing)->get()->toArray();
    }

    /**
     * Get venues by type
     */
    public function getVenuesByType(string $type): array
    {
        return Venue::where('type', $type)->get()->toArray();
    }

    /**
     * Get active venues only
     */
    public function getActiveVenues(): array
    {
        return Venue::where('is_active', true)->get()->toArray();
    }

    /**
     * Search venues by name
     */
    public function searchVenues(string $searchTerm): array
    {
        return Venue::where('name', 'like', "%{$searchTerm}%")
            ->orWhere('description', 'like', "%{$searchTerm}%")
            ->get()
            ->toArray();
    }
}
