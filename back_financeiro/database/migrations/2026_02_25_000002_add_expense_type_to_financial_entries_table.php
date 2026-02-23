<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->enum('expense_type', ['fixa', 'variavel', 'imposto'])->default('fixa')->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->dropColumn('expense_type');
        });
    }
};
