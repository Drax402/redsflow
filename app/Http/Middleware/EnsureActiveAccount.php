<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if ($user && $user->is_disabled) {
            Auth::logout();
            $request->session()->invalidate();
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return $next($request);
    }
}
