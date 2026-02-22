<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epi extends Model
{
    use HasFactory;

    protected $table = 'epis';

    protected $fillable = [
        'name',
        'description',
        'stock_quantity',
        'ca_number',
    ];

    public function assignments()
    {
        return $this->hasMany(EpiAssignment::class);
    }
}
