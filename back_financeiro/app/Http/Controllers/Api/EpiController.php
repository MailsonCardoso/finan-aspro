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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);
        return Epi::create($data);
    }

    public function update(Request $request, Epi $epi)
    {
        $data = $request->validate([
            'name' => 'string',
            'description' => 'nullable|string',
        ]);
        $epi->update($data);
        return $epi;
    }

    public function destroy(Epi $epi)
    {
        $epi->delete();
        return response()->noContent();
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

    public function returnAssignment(Request $request, EpiAssignment $assignment)
    {
        $data = $request->validate([
            'return_date' => 'required|date',
            'return_reason' => 'required|string',
        ]);

        $assignment->update([
            'return_date' => $data['return_date'],
            'return_reason' => $data['return_reason'],
            'status' => 'returned'
        ]);

        return $assignment;
    }

    public function destroyAssignment(EpiAssignment $assignment)
    {
        $assignment->delete();
        return response()->noContent();
    }
}
