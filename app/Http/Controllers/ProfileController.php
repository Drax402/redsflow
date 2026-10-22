<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['nullable', 'string', 'regex:/^[A-Za-z0-9._]{4,30}$/', Rule::unique('users', 'username')->ignore($user->id)],
            'sex' => 'nullable|string|max:50',
            'bday' => 'nullable|date|before_or_equal:today',
            'address' => 'nullable|string|max:255',
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'contact' => 'nullable|string|max:50',
        ]);

        if (!empty($data['bday']) && \Carbon\Carbon::parse($data['bday'])->age < 18) {
            return response()->json(['message' => 'Birthdate must be 18 years old or above.'], 422);
        }

        $user->update([
            'name' => $data['name'],
            'username' => isset($data['username']) ? strtolower($data['username']) : $user->username,
            'gender' => $data['sex'] ?? $user->gender,
            'dob' => $data['bday'] ?? $user->dob,
            'brgy' => $data['address'] ?? $user->brgy,
            'email' => $data['email'] ?? $user->email,
            'contact' => $data['contact'] ?? $user->contact,
        ]);

        $user = $user->fresh();
        ActivityLog::syncStaffProfile($user);
        ActivityLog::userEvent($user->id, 'update_profile', $request->ip());
        ActivityLog::notifyUser($user->id, 'Your Account Information was updated.');

        AuditLog::record($user->id, 'update_profile', "{$user->name} updated their own Account Information.");

        return response()->json(['user' => $user->fresh()->toFrontendArray()]);
    }
}
