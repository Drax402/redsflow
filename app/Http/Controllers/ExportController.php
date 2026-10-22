<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Donor;
use App\Models\ExportGuard;
use App\Services\OtpEmailSender;
use App\Support\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class ExportController extends Controller
{
    private const MAX_EXPORTS_PER_DAY = 3;
    private const MAX_WRONG_PASSWORDS = 3;
    private const LOCK_SECONDS = 86400;

    private const OTP_SESSION_KEY = 'export_otp_verified_at';
    private const OTP_VALID_MINUTES = 10;

    public function sendOtp(Request $request, OtpEmailSender $mailer)
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = $request->user();
        $email = strtolower($user->email);

        if (strtolower(trim($data['email'])) !== $email) {
            return response()->json(['message' => 'That Gmail address does not match your account.'], 422);
        }

        if ($error = app(AuthController::class)->issueOtp($email, $mailer, 'export')) {
            return $error;
        }

        $request->session()->forget(self::OTP_SESSION_KEY);

        return response()->json([
            'message' => 'Verification code sent.',
            'email' => $this->maskEmail($email),
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate(['code' => 'required|string']);
        $user = $request->user();

        $otp = app(AuthController::class)->findValidOtp(strtolower($user->email), $data['code']);
        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired verification code.', 'code' => 'bad_otp'], 422);
        }

        $otp->consumed = true;
        $otp->save();
        $request->session()->put(self::OTP_SESSION_KEY, now()->timestamp);

        return response()->json(['message' => 'Code verified.']);
    }

    private function maskEmail(string $email): string
    {
        [$name, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $visible = substr($name, 0, 2);
        return $visible . str_repeat('*', max(1, strlen($name) - 2)) . '@' . $domain;
    }

    private function otpIsVerified(Request $request): bool
    {
        $at = (int) $request->session()->get(self::OTP_SESSION_KEY, 0);
        return $at > 0 && now()->timestamp - $at <= self::OTP_VALID_MINUTES * 60;
    }

    public function authorizeExport(Request $request)
    {
        $data = $request->validate(['password' => 'required|string']);
        $user = $request->user();

        if (!$this->otpIsVerified($request)) {
            return response()->json([
                'message' => 'Please verify the code sent to your email first.',
                'code' => 'otp_required',
            ], 403);
        }

        if (!\Illuminate\Support\Facades\Schema::hasTable('export_guards')) {
            if (!\Illuminate\Support\Facades\Hash::check($data['password'], $user->password)) {
                return response()->json(['message' => 'Incorrect password.', 'code' => 'wrong', 'attempts_left' => 3], 422);
            }

            $request->session()->forget(self::OTP_SESSION_KEY);
            $count = Donor::count();
            ActivityLog::staffActivity($user, 'exported the Donor Masterlist');
            AuditLog::recordDonorAction($user->id, 'Export', null, null, "Full Masterlist ({$count} donor" . ($count === 1 ? '' : 's') . ')');

            return response()->json([
                'message' => 'Authorized.',
                'notice' => 'Setup needed: run "php artisan migrate" so export limits (3 per day) can be enforced.',
            ]);
        }

        $guard = ExportGuard::firstOrCreate(['user_id' => $user->id]);
        $now = now();

        $recent = collect($guard->exports ?? [])
            ->map(fn ($t) => Carbon::parse($t))
            ->filter(fn ($t) => $t->greaterThan($now->copy()->subDay()))
            ->sortBy(fn ($t) => $t->timestamp)
            ->values();

        if ($recent->count() >= self::MAX_EXPORTS_PER_DAY) {
            $retry = max(1, (int) ceil(abs($now->diffInSeconds($recent->first()->copy()->addDay(), false))));
            return response()->json([
                'message' => 'Export limit reached. Please try again later.',
                'code' => 'quota',
                'retry_after' => $retry,
            ], 429);
        }

        if ($guard->locked_until && $guard->locked_until->greaterThan($now)) {
            $retry = max(1, (int) ceil(abs($now->diffInSeconds($guard->locked_until, false))));
            return response()->json([
                'message' => 'Too many incorrect password attempts.',
                'code' => 'locked',
                'retry_after' => $retry,
            ], 429);
        }

        if (!Hash::check($data['password'], $user->password)) {
            $guard->failed_attempts = (int) $guard->failed_attempts + 1;

            if ($guard->failed_attempts >= self::MAX_WRONG_PASSWORDS) {
                $guard->failed_attempts = 0;
                $guard->locked_until = $now->copy()->addSeconds(self::LOCK_SECONDS);
                $guard->save();

                return response()->json([
                    'message' => 'Incorrect password. Too many attempts.',
                    'code' => 'locked',
                    'retry_after' => self::LOCK_SECONDS,
                ], 429);
            }

            $guard->save();
            $left = self::MAX_WRONG_PASSWORDS - $guard->failed_attempts;

            return response()->json([
                'message' => 'Incorrect password.',
                'code' => 'wrong',
                'attempts_left' => $left,
            ], 422);
        }

        $recent->push($now);
        $guard->failed_attempts = 0;
        $guard->locked_until = null;
        $guard->exports = $recent->map(fn ($t) => $t->toIso8601String())->all();
        $guard->save();

        $request->session()->forget(self::OTP_SESSION_KEY);
        $count = Donor::count();
        ActivityLog::staffActivity($user, 'exported the Donor Masterlist');
        AuditLog::recordDonorAction($user->id, 'Export', null, null, "Full Masterlist ({$count} donor" . ($count === 1 ? '' : 's') . ')');

        return response()->json([
            'message' => 'Authorized.',
            'exports_left' => self::MAX_EXPORTS_PER_DAY - $recent->count(),
        ]);
    }
}
