<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'administrador@financeiro.com.br'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('@Secur1t1@'),
                'cpf' => '000.000.000-00',
                'role' => 'admin',
            ]
        );
    }
}
