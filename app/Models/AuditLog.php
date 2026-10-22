<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'audit_log';

    protected $fillable = [
        'user_id', 'user_name', 'user_role', 'action', 'action_label',
        'donor_id', 'donor_name', 'details', 'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'donor_name' => SafeEncrypted::class,
        'details' => SafeEncrypted::class,
    ];

    public static function record(?int $userId, string $action, ?string $details = null): void
    {
        $actor = Auth::user() ?? ($userId ? User::find($userId) : null);
        static::create([
            'user_id' => $userId,
            'user_name' => $actor?->name,
            'user_role' => $actor?->role,
            'action' => $action,
            'details' => $details,
            'logged_at' => now(),
        ]);
    }

    public static function recordDonorAction(?int $userId, string $actionLabel, ?int $donorId, ?string $donorName, ?string $details = null, $actorOverride = null): void
    {
        $actor = $actorOverride ?: Auth::user();
        static::create([
            'user_id' => $actorOverride ? $actorOverride->id : $userId,
            'user_name' => $actor?->name ?? 'Unknown User',
            'user_role' => $actor?->role ?? 'Unknown',
            'action' => strtolower($actionLabel) . '_donor_record',
            'action_label' => $actionLabel,
            'donor_id' => $donorId,
            'donor_name' => $donorName,
            'details' => $details,
            'logged_at' => now(),
        ]);
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => (string) $this->id,
            'timestamp' => optional($this->logged_at)->toISOString(),
            'userId' => $this->user_id,
            'userName' => $this->user_name,
            'userRole' => $this->user_role,
            'action' => $this->action_label,
            'donorId' => $this->donor_id,
            'donorName' => $this->donor_name,
            'details' => $this->details,
        ];
    }
}
