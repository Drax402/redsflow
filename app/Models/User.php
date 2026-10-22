<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use App\Casts\SafeEncryptedDate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'uuid', 'name', 'username', 'email', 'password', 'contact', 'brgy', 'gender',
        'ext_name', 'dob', 'role', 'status', 'id_front_path', 'id_back_path',
        'face_doc_path', 'action_taken', 'last_login_at', 'failed_login_attempts', 'locked_until',
        'approved_by', 'approved_at',
        'is_disabled', 'disabled_at', 'disabled_by',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'password' => 'hashed',
        'name' => SafeEncrypted::class,
        'ext_name' => SafeEncrypted::class,
        'contact' => SafeEncrypted::class,
        'brgy' => SafeEncrypted::class,
        'gender' => SafeEncrypted::class,
        'dob' => SafeEncryptedDate::class,
        'last_login_at' => 'datetime',
        'locked_until' => 'datetime',
        'approved_at' => 'datetime',
        'disabled_at' => 'datetime',
        'is_disabled' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });

        static::deleted(function (User $user) {
            $crypto = app(\App\Services\ImageCryptoService::class);
            $crypto->delete($user->id_front_path);
            $crypto->delete($user->id_back_path);
            $crypto->delete($user->face_doc_path);
        });
    }

    public static function makeUniqueUsername(string $wanted, ?int $exceptId = null): string
    {
        $base = Str::of($wanted)->lower()->ascii()->replaceMatches('/[^a-z0-9._]+/', '.')->trim('.')->limit(24, '')->toString();
        if (strlen($base) < 4) {
            $base = str_pad($base ?: 'user', 4, '0');
        }
        $candidate = $base;
        $i = 1;
        while (static::where('username', $candidate)->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists()) {
            $candidate = $base . $i++;
        }
        return $candidate;
    }

    public function staffProfile()
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function notifications_app()
    {
        return $this->hasMany(AppNotification::class);
    }

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    public const ROLE_MEDTECH = 'Blood Bank MedTech';

    public function hasRoleAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function hasRoleMedTech(): bool
    {
        return $this->role === self::ROLE_MEDTECH;
    }

    /** Admin or Blood Bank MedTech: screens donors and manages blood inventory/storage. */
    public function canManageInventory(): bool
    {
        return $this->hasRoleAdmin() || $this->hasRoleMedTech();
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'contact' => $this->contact,
            'brgy' => $this->brgy,
            'gender' => $this->gender,
            'extName' => $this->ext_name,
            'dob' => optional($this->dob)->format('Y-m-d'),
            'idFront' => $this->id_front_path ? "/secure-image/{$this->id}/id_front" : null,
            'idBack' => $this->id_back_path ? "/secure-image/{$this->id}/id_back" : null,
            'faceDoc' => $this->face_doc_path ? "/secure-image/{$this->id}/face_doc" : 'picture.jpg',
            'registeredAt' => optional($this->created_at)->toISOString(),
            'lastLogin' => optional($this->last_login_at)->toISOString(),
            'actionTaken' => $this->action_taken,
            'approvedBy' => $this->approver?->name,
            'approvedAt' => optional($this->approved_at)->toISOString(),
            'isDisabled' => (bool) $this->is_disabled,
            'disabledAt' => optional($this->disabled_at)->toISOString(),
            'actionAt' => optional($this->disabled_at ?? $this->approved_at ?? $this->created_at)->toISOString(),
        ];
    }
}
