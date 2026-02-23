<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EpiController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Clientes e Despesas
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('users', UserController::class);

    // Configurações
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings', [SettingsController::class, 'update']);

    // Financeiro
    Route::get('/dashboard/stats', [FinancialController::class, 'dashboardStats']);
    Route::get('/financial/dre', [FinancialController::class, 'dre']);
    Route::get('/financial/entries', [FinancialController::class, 'index']);
    Route::post('/financial/entries', [FinancialController::class, 'store']);
    Route::patch('/financial/entries/{id}/status', [FinancialController::class, 'updateStatus']);

    // RH & Funcionários
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

    // EPIs
    Route::get('/epis', [EpiController::class, 'index']);
    Route::post('/epis', [EpiController::class, 'store']);
    Route::put('/epis/{epi}', [EpiController::class, 'update']);
    Route::delete('/epis/{epi}', [EpiController::class, 'destroy']);
    Route::get('/epis/assignments', [EpiController::class, 'assignments']);
    Route::post('/epis/assignments', [EpiController::class, 'storeAssignment']);
    Route::patch('/epis/assignments/{assignment}/return', [EpiController::class, 'returnAssignment']);
});
