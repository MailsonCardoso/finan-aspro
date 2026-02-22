<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Epi;
use App\Models\EpiAssignment;
use Illuminate\Http\Request;

class EpiController extends Controller
{
    public function index()
    {
        return Epi::all();
    }

    public function assignments()
    {
        return EpiAssignment::with(['employee', 'epi'])->get();
    }

    public function storeAssignment(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'epi_id' => 'required|exists:epis,id',
            'assignment_date' => 'required|date',
            'expiry_date' => 'nullable|date',
        ]);

        return EpiAssignment::create($data);
    }
}
