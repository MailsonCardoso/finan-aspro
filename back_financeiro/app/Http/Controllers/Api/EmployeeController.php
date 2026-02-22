<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        return Employee::with('epiAssignments.epi')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'role' => 'required|string',
            'department' => 'required|string',
            'admission_date' => 'required|date',
            'salary' => 'nullable|numeric',
        ]);

        return Employee::create($data);
    }

    public function show(Employee $employee)
    {
        return $employee->load('epiAssignments.epi');
    }
}
