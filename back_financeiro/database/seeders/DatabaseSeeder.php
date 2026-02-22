<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrador Financeiro',
            'email' => 'administrador@financeiro.com.br',
            'password' => Hash::make('@Secur1t1@'),
        ]);
    }
}
