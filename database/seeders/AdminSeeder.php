<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower((string) env('ADMIN_EMAIL', 'adminredflow402@gmail.com'));

        if (User::where('email', $email)->exists()) {
            $this->command?->info("Admin {$email} already exists — nothing changed (password NOT reset).");
            return;
        }

        $password = (string) env('ADMIN_PASSWORD', '');
        $generated = false;
        if ($password === '') {
            $password = Str::random(14) . '#' . random_int(10, 99);
            $generated = true;
        }

        User::create([
            'email' => $email,
            'name' => 'Admin RedFlow',
            'username' => 'adminredflow',
            'contact' => '09000000000',
            'gender' => 'Male',
            'dob' => '1990-01-01',
            'brgy' => 'Bagsangan',
            'password' => $password,
            'role' => 'Admin',
            'status' => 'Approved',
            'action_taken' => 'Approved',
        ]);

        $this->command?->info("Admin account created: {$email}");
        if ($generated) {
            $this->command?->warn("Temporary password (shown only once): {$password}");
            $this->command?->warn('Log in and change it right away from Account Security.');
        }
    }
}
