<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('expense_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bank_account')->nullable(); // Nubank, Banco Inter
            $table->string('payment_method')->nullable(); // pix, dinheiro, cartao_credito, cartao_debito
        });
    }

    public function down()
    {
        Schema::table('financial_entries', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['expense_id']);
            $table->dropColumn(['client_id', 'expense_id', 'bank_account', 'payment_method']);
        });
    }
};
