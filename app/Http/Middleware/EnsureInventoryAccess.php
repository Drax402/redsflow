<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureInventoryAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (!$user || !$user->canManageInventory()) {
            abort(403, 'Administrators and Blood Bank MedTech only.');
        }

        return $next($request);
    }
}
