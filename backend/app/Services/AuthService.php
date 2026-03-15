<?php

namespace App\Services;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Authenticate admin user
     */
    public function login(string $username, string $password): ?array
    {
        // Check for hardcoded superadmin credentials first
        if ($username === 'super@admin.com' && $password === 'superadmin123') {
            return [
                'success' => true,
                'message' => 'Login successful',
                'token' => 'superadmin-token-' . md5(time()),
                'admin' => [
                    'id' => 0,
                    'name' => 'Super Administrator',
                    'username' => 'super@admin.com',
                    'email' => 'super@admin.com',
                    'role' => 'super_admin',
                    'permissions' => ['view_only'] // Read-only access
                ]
            ];
        }

        $admin = Admin::where('username', $username)->first();

        if (!$admin || !Hash::check($password, $admin->password)) {
            return null;
        }

        // Generate simple token (in production, use Sanctum or JWT)
        $token = 'admin-token-' . md5($admin->id . time());

        return [
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'username' => $admin->username,
                'email' => $admin->email,
                'role' => $admin->role
            ]
        ];
    }

    /**
     * Logout user (clear token)
     */
    public function logout(): array
    {
        return [
            'success' => true,
            'message' => 'Logout successful'
        ];
    }

    /**
     * Get current authenticated user
     */
    public function getCurrentUser(): array
    {
        return [
            'success' => true,
            'admin' => [
                'id' => 1,
                'name' => 'System Administrator',
                'username' => 'admin',
                'email' => 'admin@bellevue.com',
                'role' => 'super_admin'
            ]
        ];
    }

    /**
     * Validate admin credentials
     */
    public function validateCredentials(string $username, string $password): bool
    {
        $admin = Admin::where('username', $username)->first();
        
        if (!$admin) {
            return false;
        }
        
        return Hash::check($password, $admin->password);
    }
}
