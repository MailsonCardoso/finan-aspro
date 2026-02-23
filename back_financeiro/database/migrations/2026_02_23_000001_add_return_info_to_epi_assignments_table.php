<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('epi_assignments', function (Blueprint $table) {
            $table->date('return_date')->nullable()->after('expiry_date');
            $table->string('return_reason')->nullable()->after('return_date');
        });
    }

    public function down(): void
    {
        Schema::table('epi_assignments', function (Blueprint $table) {
            $table->dropColumn(['return_date', 'return_reason']);
        });
    }
};
