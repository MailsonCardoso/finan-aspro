<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_entries', function (Blueprint $col) {
            $col->id();
            $col->string('description');
            $col->decimal('value', 15, 2);
            $col->date('due_date');
            $col->date('payment_date')->nullable();
            $col->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $col->enum('type', ['income', 'expense']);
            $col->string('category')->nullable(); // Ex: Fornecedores, Impostos, Folha
            $col->text('observations')->nullable();
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_entries');
    }
};
