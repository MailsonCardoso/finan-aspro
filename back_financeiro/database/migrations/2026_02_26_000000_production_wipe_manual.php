<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        $tables = [
            'financial_entries',
            'epi_assignments',
            'epis',
            'employees',
            'clients',
            'expenses'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        Schema::enableForeignKeyConstraints();

        // Re-insert standard settings
        if (Schema::hasTable('settings')) {
            DB::table('settings')->updateOrInsert(
                ['id' => 1],
                [
                    'company_name' => 'CapitalPro ERP',
                    'updated_at' => now()
                ]
            );
        }
    }

    public function down(): void
    {
    }
};
