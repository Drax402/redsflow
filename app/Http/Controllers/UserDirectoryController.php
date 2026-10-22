<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserDirectoryController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $me = $request->user();

        $users = $me && $me->hasRoleAdmin()
            ? User::orderBy('id')->get()
            : User::where('id', $me?->id)->get();

        return response()->json([
            'users' => $users->map->toFrontendArray(),
        ]);
    }

    public function destroy(string $uuid)
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        if ($user->role === 'Admin' && User::where('role', 'Admin')->count() <= 1) {
            return response()->json(['message' => 'The last remaining Admin account cannot be deleted.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function destroyBulk(\Illuminate\Http\Request $request)
    {
        $uuids = $request->input('ids', []);
        $skipped = [];

        foreach (User::whereIn('uuid', $uuids)->get() as $user) {
            if ($user->role === 'Admin' && User::where('role', 'Admin')->count() <= 1) {
                $skipped[] = $user->name;
                continue;
            }
            $user->delete();
        }

        return response()->json(['message' => 'Deleted.', 'skipped' => $skipped]);
    }
}
