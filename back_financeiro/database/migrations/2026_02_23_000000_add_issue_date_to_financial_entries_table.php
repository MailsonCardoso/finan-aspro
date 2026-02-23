<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->date('issue_date')->nullable()->after('due_date');
        });

        // Populate existing records with due_date if issue_date is null
        DB::table('financial_entries')->whereNull('issue_date')->update([
            'issue_date' => DB::raw('due_date')
        ]);
    }

    public function down(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->dropColumn('issue_date');
        });
    }
};
