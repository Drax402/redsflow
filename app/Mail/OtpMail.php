<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $code, public string $purpose = 'reset')
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine());
    }

    public function subjectLine(): string
    {
        if ($this->purpose === 'export') {
            return 'REDFLOW Export Verification Code';
        }
        return $this->purpose === 'change'
            ? 'REDFLOW Change Password Verification Code'
            : 'REDFLOW Password Reset Code';
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<p>Your REDFLOW ' . ($this->purpose === 'export' ? 'Donor Masterlist export' : ($this->purpose === 'change' ? 'change password' : 'password reset')) . ' verification code is:</p>'
                . '<h1 style="letter-spacing:6px;">' . e($this->code) . '</h1>'
                . '<p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>'
        );
    }
}
