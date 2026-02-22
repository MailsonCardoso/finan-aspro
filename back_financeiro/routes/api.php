<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EpiController;
use App\Http\Controllers\Api\FinancialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Financeiro
    Route::get('/dashboard/stats', [FinancialController::class, 'dashboardStats']);
    Route::get('/financial/entries', [FinancialController::class, 'index']);
    Route::post('/financial/entries', [FinancialController::class, 'store']);
    Route::patch('/financial/entries/{id}/status', [FinancialController::class, 'updateStatus']);

    // RH & Funcionários
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);

    // EPIs
    Route::get('/epis', [EpiController::class, 'index']);
    Route::get('/epis/assignments', [EpiController::class, 'assignments']);
    Route::post('/epis/assignments', [EpiController::class, 'storeAssignment']);
});
