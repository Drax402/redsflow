<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use App\Casts\SafeEncryptedArray;
use Illuminate\Database\Eloquent\Model;

class EditRequest extends Model
{
    protected $fillable = [
        'requested_by', 'type', 'donor_id', 'donor_name', 'payload', 'original', 'reason',
        'status', 'reviewed_by', 'reviewed_at', 'hidden_by_requester',
    ];

    protected $casts = [
        'donor_name' => SafeEncrypted::class,
        'payload' => SafeEncryptedArray::class,
        'original' => SafeEncryptedArray::class,
        'reason' => SafeEncrypted::class,
        'reviewed_at' => 'datetime',
        'hidden_by_requester' => 'boolean',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'donorId' => $this->donor_id,
            'donorName' => $this->donor_name,
            'payload' => $this->payload ?? [],
            'original' => $this->original ?? [],
            'reason' => $this->reason,
            'status' => $this->status,
            'requestedBy' => $this->requester?->name,
            'requestedByUsername' => $this->requester?->username,
            'requestedByUserId' => $this->requester?->uuid,
            'reviewedBy' => $this->reviewer?->name,
            'reviewedAt' => optional($this->reviewed_at)->toISOString(),
            'createdAt' => optional($this->created_at)->toISOString(),
        ];
    }
}
