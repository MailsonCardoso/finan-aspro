<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EpiAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'epi_id',
        'assignment_date',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function epi()
    {
        return $this->belongsTo(Epi::class);
    }
}
