<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'value',
        'due_date',
        'payment_date',
        'status',
        'type',
        'category',
        'observations',
    ];

    protected $casts = [
        'due_date' => 'date',
        'payment_date' => 'date',
        'value' => 'decimal:2',
    ];
}
