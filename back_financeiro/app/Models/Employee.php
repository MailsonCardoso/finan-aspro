<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'department',
        'admission_date',
        'salary',
        'status',
    ];

    protected $casts = [
        'admission_date' => 'date',
        'salary' => 'decimal:2',
    ];

    public function epiAssignments()
    {
        return $this->hasMany(EpiAssignment::class);
    }
}
