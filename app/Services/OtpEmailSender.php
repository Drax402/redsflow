<?php

namespace App\Services;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class OtpEmailSender
{
    public function send(string $to, string $code, string $purpose = 'reset'): void
    {
        $provider = strtolower((string) config('mail.default'));

        if ($provider === 'brevo') {
            $this->sendViaBrevo($to, $code, $purpose);
            return;
        }

        if ($provider === 'resend') {
            $this->sendViaResend($to, $code, $purpose);
            return;
        }

        $this->capSocketTimeout();
        Mail::to($to)->send(new OtpMail($code, $purpose));
    }

    public function sendMessage(string $to, string $subject, string $html): void
    {
        $provider = strtolower((string) config('mail.default'));

        if ($provider === 'brevo') {
            $response = Http::timeout(15)
                ->withHeaders(['api-key' => $this->apiKey(), 'accept' => 'application/json'])
                ->post('https://api.brevo.com/v3/smtp/email', [
                    'sender' => ['name' => $this->fromName(), 'email' => $this->fromAddress()],
                    'to' => [['email' => $to]],
                    'subject' => $subject,
                    'htmlContent' => $html,
                ]);
            if (!$response->successful()) {
                throw new RuntimeException('Brevo API error ' . $response->status() . ': ' . $response->body());
            }
            return;
        }

        if ($provider === 'resend') {
            $response = Http::timeout(15)
                ->withToken($this->apiKey())
                ->post('https://api.resend.com/emails', [
                    'from' => $this->fromName() . ' <' . $this->fromAddress() . '>',
                    'to' => [$to],
                    'subject' => $subject,
                    'html' => $html,
                ]);
            if (!$response->successful()) {
                throw new RuntimeException('Resend API error ' . $response->status() . ': ' . $response->body());
            }
            return;
        }

        $this->capSocketTimeout();
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });
    }

    protected function capSocketTimeout(): void
    {
        ini_set('default_socket_timeout', (string) (int) (config('mail.timeout') ?: env('MAIL_TIMEOUT', 8)));
    }

    protected function apiKey(): string
    {
        $key = (string) config('mail.mailers.smtp.password');
        if ($key === '' || $key === 'null') {
            throw new RuntimeException('MAIL_PASSWORD (the email provider API key) is not set.');
        }
        return $key;
    }

    protected function fromAddress(): string
    {
        return (string) config('mail.from.address');
    }

    protected function fromName(): string
    {
        $name = (string) config('mail.from.name');
        if ($name === '' || str_contains($name, '${')) {
            return (string) (config('app.name') && !str_contains((string) config('app.name'), '${') ? config('app.name') : 'REDFLOW');
        }
        return $name;
    }

    protected function html(string $code, string $purpose = 'reset'): string
    {
        $what = $purpose === 'export' ? 'Donor Masterlist export' : ($purpose === 'change' ? 'change password' : 'password reset');
        return '<p>Your REDFLOW ' . $what . ' verification code is:</p>'
            . '<h1 style="letter-spacing:6px;">' . e($code) . '</h1>'
            . '<p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>';
    }

    protected function sendViaBrevo(string $to, string $code, string $purpose = 'reset'): void
    {
        $response = Http::timeout(20)
            ->withHeaders(['api-key' => $this->apiKey(), 'accept' => 'application/json'])
            ->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => ['name' => $this->fromName(), 'email' => $this->fromAddress()],
                'to' => [['email' => $to]],
                'subject' => (new OtpMail($code, $purpose))->subjectLine(),
                'htmlContent' => $this->html($code, $purpose),
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Brevo API error ' . $response->status() . ': ' . $response->body());
        }
    }

    protected function sendViaResend(string $to, string $code, string $purpose = 'reset'): void
    {
        $response = Http::timeout(20)
            ->withToken($this->apiKey())
            ->post('https://api.resend.com/emails', [
                'from' => $this->fromName() . ' <' . $this->fromAddress() . '>',
                'to' => [$to],
                'subject' => (new OtpMail($code, $purpose))->subjectLine(),
                'html' => $this->html($code, $purpose),
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Resend API error ' . $response->status() . ': ' . $response->body());
        }
    }
}
