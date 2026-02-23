<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations to clear all data for a fresh start before client presentation.
     */
    public function up(): void
    {
        // Desativar chaves estrangeiras para limpeza total
        Schema::disableForeignKeyConstraints();

        // Tabelas operacionais para limpar (Mantendo Users e Migrations)
        $tables = [
            'financial_entries',
            'epi_assignments',
            'epis',
            'employees',
            'clients',
            'expenses',
            'settings',
            'personal_access_tokens'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        // Reativar chaves estrangeiras
        Schema::enableForeignKeyConstraints();

        // Recriar configuração padrão básica com a marca CapitalPro
        if (Schema::hasTable('settings')) {
            DB::table('settings')->insert([
                'company_name' => 'CapitalPro ERP',
                'theme_id' => 'purple',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Operação irreversível
    }
};
