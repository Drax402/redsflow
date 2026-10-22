<?php

namespace App\Support;

use App\Models\User;
use App\Services\OtpEmailSender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LoginAlert
{
    public static function queue(User $user, Request $request): void
    {
        $data = self::collect($user, $request);

        app()->terminating(function () use ($data) {
            self::deliver(
                $data['email'],
                'REDFLOW Login Alert: new login to your account',
                self::html(
                    $data,
                    'New login to your REDFLOW account',
                    'Your REDFLOW account was just logged in. Here are the details:',
                    'If this was you, no action is needed. If this was NOT you, change your password right away in Account Security and tell your system Administrator.'
                )
            );
        });
    }

    public static function queueLockout(User $user, Request $request): void
    {
        $data = self::collect($user, $request);

        app()->terminating(function () use ($data) {
            self::deliver(
                $data['email'],
                'REDFLOW Security Alert: too many failed login attempts',
                self::html(
                    $data,
                    'Someone tried to log in to your account',
                    'There were several failed login attempts on your REDFLOW account, so it was temporarily locked for a short time. Here are the details of the last attempt:',
                    'If this was you, wait for the lock to end and try again (or use Forgot Password). If this was NOT you, someone may be guessing your password — change it right away after logging in and tell your system Administrator.'
                )
            );
        });
    }

    protected static function deliver(string $to, string $subject, string $html): void
    {
        try {
            app(OtpEmailSender::class)->sendMessage($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::warning('Login alert email failed: ' . $e->getMessage());
        }
    }

    protected static function collect(User $user, Request $request): array
    {
        return [
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'time' => now(),
            'ip' => self::clientIp($request),
            'device' => self::describeDevice((string) $request->userAgent()),
        ];
    }

    public static function clientIp(Request $request): string
    {
        $forwarded = (string) $request->header('X-Forwarded-For');
        if ($forwarded !== '') {
            $first = trim(explode(',', $forwarded)[0]);
            if (filter_var($first, FILTER_VALIDATE_IP)) {
                return $first;
            }
        }

        return (string) $request->ip();
    }

    protected static function describeDevice(string $ua): string
    {
        $browser = 'Unknown browser';
        if (preg_match('/Edg(e|A|iOS)?\//', $ua)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/OPR\/|Opera/', $ua)) {
            $browser = 'Opera';
        } elseif (preg_match('/Firefox\/|FxiOS/', $ua)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Chrome\/|CriOS/', $ua)) {
            $browser = 'Google Chrome';
        } elseif (preg_match('/Safari\//', $ua)) {
            $browser = 'Safari';
        }

        $os = 'unknown device';
        if (preg_match('/Windows/', $ua)) {
            $os = 'Windows';
        } elseif (preg_match('/Android/', $ua)) {
            $os = 'Android';
        } elseif (preg_match('/iPhone|iPad|iPod/', $ua)) {
            $os = 'iOS';
        } elseif (preg_match('/Macintosh|Mac OS X/', $ua)) {
            $os = 'macOS';
        } elseif (preg_match('/Linux/', $ua)) {
            $os = 'Linux';
        }

        return "{$browser} on {$os}";
    }

    protected static function html(array $d, string $title, string $intro, string $advice): string
    {
        $e = fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
        $when = $d['time']->copy()->timezone('Asia/Manila')->format('F j, Y \a\t g:i A') . ' (Philippine Time)';

        $rows = [
            'Account' => $d['name'] . ' (' . $d['role'] . ')',
            'Date and time' => $when,
            'Device' => $d['device'],
            'IP address' => $d['ip'],
        ];
        $tr = '';
        foreach ($rows as $label => $value) {
            $tr .= '<tr><td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;">' . $e($label)
                . '</td><td style="padding:8px 12px;color:#111;font-size:14px;font-weight:600;">' . $e($value) . '</td></tr>';
        }

        return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">'
            . '<div style="background:#c8102e;color:#fff;padding:16px 20px;font-size:20px;font-weight:bold;">RED<span style="color:#111;background:#fff;padding:0 4px;border-radius:3px;margin-left:2px;">FLOW</span></div>'
            . '<div style="padding:20px;">'
            . '<h2 style="margin:0 0 10px;font-size:18px;color:#111;">' . $e($title) . '</h2>'
            . '<p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.5;">Hello ' . $e($d['name']) . ',<br>' . $e($intro) . '</p>'
            . '<table style="border-collapse:collapse;background:#f9fafb;border-radius:8px;width:100%;margin-bottom:16px;">' . $tr . '</table>'
            . '<p style="margin:0;color:#374151;font-size:13px;line-height:1.5;">' . $e($advice) . '</p>'
            . '</div>'
            . '<div style="background:#f3f4f6;color:#6b7280;padding:10px 20px;font-size:11px;">This is an automatic security message from REDFLOW. Please do not reply.</div>'
            . '</div>';
    }
}
