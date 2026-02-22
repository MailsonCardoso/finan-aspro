<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('employees')) {
            Schema::create('employees', function (Blueprint $col) {
                $col->id();
                $col->string('name');
                $col->string('role');
                $col->string('department');
                $col->date('admission_date');
                $col->decimal('salary', 15, 2)->nullable();
                $col->enum('status', ['active', 'inactive'])->default('active');
                $col->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
