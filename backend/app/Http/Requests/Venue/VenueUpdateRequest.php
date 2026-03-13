<?php

namespace App\Http\Requests\Venue;

use Illuminate\Foundation\Http\FormRequest;

class VenueUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'wing' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|required|integer|min:0',
            'price_per_hour' => 'sometimes|nullable|numeric|min:0',
            'description' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
