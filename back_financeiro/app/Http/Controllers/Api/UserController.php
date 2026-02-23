<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'cpf' => 'required|string|unique:users',
        ]);

        // Clean CPF for password (only numbers)
        $password = preg_replace('/\D/', '', $validated['cpf']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'cpf' => $validated['cpf'],
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        return response()->json($user, 201);
    }

    public function destroy(User $user)
    {
        // Don't allow self-deletion
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Você não pode excluir seu próprio usuário.'], 403);
        }

        $user->delete();
        return response()->json(null, 204);
    }
}
