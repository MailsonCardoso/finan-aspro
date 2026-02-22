<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('epis')) {
            Schema::create('epis', function (Blueprint $col) {
                $col->id();
                $col->string('name');
                $col->string('description')->nullable();
                $col->integer('stock_quantity')->default(0);
                $col->integer('ca_number')->nullable(); // Certificado de Aprovação
                $col->timestamps();
            });
        }

        if (!Schema::hasTable('epi_assignments')) {
            Schema::create('epi_assignments', function (Blueprint $col) {
                $col->id();
                $col->foreignId('employee_id')->constrained()->onDelete('cascade');
                $col->foreignId('epi_id')->constrained()->onDelete('cascade');
                $col->date('assignment_date');
                $col->date('expiry_date')->nullable();
                $col->enum('status', ['delivered', 'returned', 'expired'])->default('delivered');
                $col->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('epi_assignments');
        Schema::dropIfExists('epis');
    }
};
