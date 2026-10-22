<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Support\ActivityLog;
use App\Support\LoginAlert;
use App\Services\ImageCryptoService;
use App\Services\OtpEmailSender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected const MAX_ATTEMPTS = 5;
    protected const LOCKOUT_SECONDS = 60;

    public function showEntry()
    {
        return view('entry');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string|max:255',
            'password' => 'required|string',
        ]);

        $login = strtolower(trim($data['email']));
        $user = filter_var($login, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $login)->first()
            : User::where('username', ltrim($login, '@'))->first();

        if ($user && $user->isLocked()) {
            $seconds = max(1, (int) ceil(now()->diffInSeconds($user->locked_until, false)));
            return response()->json([
                'message' => "Error: Too many failed login attempts. Please wait {$seconds} second(s) before trying again.",
            ], 423);
        }

        if (!$user || !Hash::check($data['password'], $user->password)) {
            if ($user) {
                ActivityLog::userEvent($user->id, 'failed_login', $request->ip());
                $user->failed_login_attempts++;
                if ($user->failed_login_attempts >= self::MAX_ATTEMPTS) {
                    $user->locked_until = now()->addSeconds(self::LOCKOUT_SECONDS);
                    $user->failed_login_attempts = 0;
                    LoginAlert::queueLockout($user, $request);
                }
                $user->save();
            }
            return response()->json(['message' => 'Error: Incorrect Email/Username or Password! Please check your credentials.'], 401);
        }

        if ($user->is_disabled) {
            return response()->json(['message' => 'This account has been disabled by the Administrator. Please contact the Administrator.'], 403);
        }

        if ($user->status === 'Pending') {
            return response()->json(['message' => 'Your ' . ($user->role === 'Blood Bank MedTech' ? 'Blood Bank MedTech' : 'Staff') . ' Account is still waiting for Admin approval.'], 403);
        }

        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->last_login_at = now();
        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        ActivityLog::userEvent($user->id, 'login', $request->ip());
        ActivityLog::syncStaffProfile($user);

        $recentDuplicate = AppNotification::where('user_id', $user->id)
            ->where('message', 'like', 'Your account (%) was logged in and used.')
            ->where('created_at', '>=', now()->subSeconds(10))
            ->exists();

        if (!$recentDuplicate) {
            AppNotification::create([
                'user_id' => $user->id,
                'message' => "Your account ({$user->role}) was logged in and used.",
                'category' => 'login',
            ]);

            LoginAlert::queue($user, $request);
        }

        AuditLog::record($user->id, 'login', "{$user->name} ({$user->role}) logged in.");

        return response()->json([
            'user' => $user->toFrontendArray(),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function register(Request $request, ImageCryptoService $crypto)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['nullable', 'string', 'regex:/^[A-Za-z0-9._]{4,30}$/'],
            'email' => ['required', 'email', 'unique:users,email', 'regex:/^[A-Za-z0-9._%+\-]+@gmail\.com$/i'],
            'password' => $this->passwordRules(),
            'contact' => 'required|string|max:50',
            'brgy' => 'required|string|max:255',
            'gender' => 'nullable|string|max:50',
            'dob' => 'nullable|date',
            'role' => 'nullable|in:Staff',
            'idFront' => 'required|string|max:8000000',
            'idBack' => 'required|string|max:8000000',
            'faceDoc' => 'required|string|max:8000000',
        ], [
            'email.regex' => 'A valid Gmail address (ending in @gmail.com) is required.',
            'faceDoc.required' => 'A camera photo is required to sign up.',
            'idFront.required' => 'A photo of the front of your ID is required.',
            'idBack.required' => 'A photo of the back of your ID is required.',
        ]);
        if (!empty($data['dob']) && \Carbon\Carbon::parse($data['dob'])->age < 18) {
            return response()->json(['message' => 'Staff must be at least 18 years old.'], 422);
        }

        $user = User::create([
            'name' => $data['name'],
            'username' => User::makeUniqueUsername($data['username'] ?? $data['name']),
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'contact' => $data['contact'],
            'brgy' => $data['brgy'],
            'gender' => $data['gender'] ?? null,
            'dob' => $data['dob'] ?? null,
            'role' => $data['role'] ?? 'Staff',
            'status' => 'Pending',
            'action_taken' => 'Registered',
            'id_front_path' => $crypto->storeEncrypted($data['idFront'] ?? null, 'ids'),
            'id_back_path' => $crypto->storeEncrypted($data['idBack'] ?? null, 'ids'),
            'face_doc_path' => $crypto->storeEncrypted($data['faceDoc'] ?? null, 'selfies'),
        ]);

        AuditLog::record($user->id, 'register', "{$user->name} submitted a {$user->role} sign-up request.");
        ActivityLog::userEvent($user->id, 'register', $request->ip());
        ActivityLog::syncStaffProfile($user);
        ActivityLog::notifyAdmins("New {$user->role} sign-up request from {$user->name} is waiting for your approval.", null, 'staff_account');

        return response()->json(['user' => $user->toFrontendArray()], 201);
    }

    public function emailAvailable(Request $request)
    {
        $e = strtolower(trim((string) $request->query('email', '')));
        return response()->json(['available' => $e !== '' && !User::where('email', $e)->exists()]);
    }

    public function usernameAvailable(Request $request)
    {
        $u = strtolower(trim((string) $request->query('username', '')));
        $ok = (bool) preg_match('/^[a-z0-9._]{4,30}$/', $u);
        $taken = $ok && User::where('username', $u)->exists();
        return response()->json([
            'valid' => $ok,
            'available' => $ok && !$taken,
            'suggestion' => ($ok && $taken) ? User::makeUniqueUsername($u) : null,
        ]);
    }

    public function logout(Request $request)
    {
        if ($user = Auth::user()) {
            AuditLog::record($user->id, 'logout', "{$user->name} logged out.");
            ActivityLog::userEvent($user->id, 'logout', $request->ip());
        }
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out.',
            'csrf_token' => csrf_token(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'current_password' => 'required|string',
            'password' => $this->passwordRules(),
            'new_email' => 'nullable|email',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Error: No logged in account found.'], 401);
        }

        $lockKey = 'cp_lock_' . $user->id;
        $failKey = 'cp_fail_' . $user->id;
        if (($until = \Illuminate\Support\Facades\Cache::get($lockKey)) && $until > now()->timestamp) {
            return response()->json([
                'message' => 'Error: Too many incorrect password attempts. Please wait ' . ($until - now()->timestamp) . ' second(s) before trying again.',
            ], 423);
        }

        $email = strtolower($data['email']);
        $otp = $email === strtolower($user->email) ? $this->findValidOtp($email, $data['code']) : null;
        if (!$otp) {
            return response()->json(['message' => 'Error: Invalid or expired verification code. Please request a new code.'], 422);
        }

        if (!Hash::check($data['current_password'], $user->password)) {
            $fails = (int) \Illuminate\Support\Facades\Cache::get($failKey, 0) + 1;
            if ($fails >= 5) {
                \Illuminate\Support\Facades\Cache::forget($failKey);
                \Illuminate\Support\Facades\Cache::put($lockKey, now()->timestamp + 60, 120);
                return response()->json(['message' => 'Error: Too many incorrect password attempts. Please wait 60 second(s) before trying again.'], 423);
            }
            \Illuminate\Support\Facades\Cache::put($failKey, $fails, 900);
            return response()->json(['message' => 'Error: Current Password is incorrect. (' . (5 - $fails) . ' attempt(s) left)'], 422);
        }
        \Illuminate\Support\Facades\Cache::forget($failKey);

        $newEmail = isset($data['new_email']) ? strtolower($data['new_email']) : null;
        $emailChanged = $newEmail !== null && $newEmail !== strtolower($user->email);
        if ($emailChanged && User::where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
            return response()->json(['message' => 'Error: That email address is already used by another account.'], 422);
        }

        $user->password = $data['password'];
        if ($emailChanged) {
            $user->email = $newEmail;
        }
        $user->save();

        if ($emailChanged) {
            AuditLog::record($user->id, 'change_email', "{$user->name} changed their account email address.");
            ActivityLog::userEvent($user->id, 'change_email', $request->ip());
            ActivityLog::notifyUser($user->id, 'Your account email address was changed.', 'password');
            ActivityLog::syncStaffProfile($user);
        }

        PasswordResetOtp::where('email', $email)->where('consumed', false)->update(['consumed' => true]);

        AuditLog::record($user->id, 'change_password', "{$user->name} changed their password.");
        ActivityLog::userEvent($user->id, 'change_password', $request->ip());
        ActivityLog::notifyUser($user->id, 'Your password was changed successfully.', 'password');
        AuditLog::recordDonorAction($user->id, 'Change', null, null, 'Change Password');

        return response()->json(['message' => 'Password updated successfully!']);
    }

    public function sendOtp(Request $request, OtpEmailSender $mailer)
    {
        $data = $request->validate(['email' => 'required|email']);
        $email = strtolower($data['email']);

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'Error: No account found with that email address.'], 404);
        }

        if ($error = $this->issueOtp($email, $mailer, 'reset')) {
            return $error;
        }

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function issueOtp(string $email, OtpEmailSender $mailer, string $purpose)
    {
        $last = PasswordResetOtp::where('email', $email)->orderByDesc('id')->first();
        if ($last && $last->created_at && $last->created_at->greaterThan(now()->subSeconds(60))) {
            $wait = max(1, 60 - (int) $last->created_at->diffInSeconds(now()));
            return response()->json([
                'message' => "Please wait {$wait} second(s) before requesting another verification code.",
            ], 429);
        }
        $recent = PasswordResetOtp::where('email', $email)->where('created_at', '>=', now()->subMinutes(10))->count();
        if ($recent >= 5) {
            return response()->json([
                'message' => 'Too many verification code requests. Please wait a few minutes before trying again.',
            ], 429);
        }

        @set_time_limit(20);

        $code = (string) random_int(100000, 999999);

        try {
            $otp = PasswordResetOtp::create([
                'email' => $email,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(10),
                'consumed' => false,
            ]);

            $mailer->send($email, $code, $purpose);
        } catch (\Throwable $e) {
            Log::error('OTP send failed (' . $purpose . '): ' . $e->getMessage());
            if (isset($otp)) {
                $otp->delete();
            }
            return response()->json([
                'message' => 'Unable to send the verification email right now. Please try again in a moment or check your internet Connection.',
            ], 500);
        }

        return null;
    }

    public function sendChangePasswordOtp(Request $request, OtpEmailSender $mailer)
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Error: No logged in account found.'], 401);
        }

        $email = strtolower($data['email']);
        if ($email !== strtolower($user->email)) {
            return response()->json(['message' => 'Error: That email address does not match your account.'], 422);
        }

        if ($error = $this->issueOtp($email, $mailer, 'change')) {
            return $error;
        }

        return response()->json(['message' => 'Verification code sent.']);
    }

    public function verifyChangePasswordOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Error: No logged in account found.'], 401);
        }

        $email = strtolower($data['email']);
        if ($email !== strtolower($user->email) || !$this->findValidOtp($email, $data['code'])) {
            return response()->json(['message' => 'Error: Invalid verification code. Please try again.'], 422);
        }

        return response()->json(['message' => 'Code verified.']);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        if (!$this->findValidOtp(strtolower($data['email']), $data['code'])) {
            return response()->json(['message' => 'Error: Invalid verification code. Please try again.'], 422);
        }

        return response()->json(['message' => 'Code verified.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => $this->passwordRules(),
        ]);

        $email = strtolower($data['email']);
        $otp = $this->findValidOtp($email, $data['code']);
        if (!$otp) {
            return response()->json(['message' => 'Error: Invalid or expired verification code.'], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'Error: No account found with that email address.'], 404);
        }

        $user->password = $data['password'];
        $user->save();

        $otp->consumed = true;
        $otp->save();

        AuditLog::record($user->id, 'password_reset', "{$user->name} reset their password via email OTP.");
        ActivityLog::userEvent($user->id, 'password_reset', $request->ip());
        ActivityLog::notifyUser($user->id, 'Your password was reset using the email verification code.', 'password');

        return response()->json(['message' => 'Password successfully reset!']);
    }

    private const MAX_OTP_ATTEMPTS = 5;

    protected function passwordRules(): array
    {
        return [
            'required',
            'string',
            'min:8',
            function ($attribute, $value, $fail) {
                if (!preg_match('/[0-9]/', (string) $value) || !preg_match('/[^A-Za-z0-9]/', (string) $value)) {
                    $fail('Password must be at least 8 characters long and contain both numbers and symbols.');
                }
            },
        ];
    }

    protected function otpHasAttemptsColumn(): bool
    {
        static $has = null;
        return $has ??= \Illuminate\Support\Facades\Schema::hasColumn('password_reset_otps', 'attempts');
    }

    public function findValidOtp(string $email, string $code): ?PasswordResetOtp
    {
        $query = PasswordResetOtp::where('email', $email)
            ->where('consumed', false)
            ->where('expires_at', '>=', now());

        if ($this->otpHasAttemptsColumn()) {
            $query->where('attempts', '<', self::MAX_OTP_ATTEMPTS);
        }

        $candidates = $query->orderByDesc('id')->get();

        foreach ($candidates as $otp) {
            if (Hash::check($code, $otp->code_hash)) {
                return $otp;
            }
        }

        if ($this->otpHasAttemptsColumn()) {
            foreach ($candidates as $otp) {
                $otp->attempts = (int) $otp->attempts + 1;
                if ($otp->attempts >= self::MAX_OTP_ATTEMPTS) {
                    $otp->consumed = true;
                }
                $otp->save();
            }
        }

        return null;
    }
}
