<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use App\Casts\SafeEncryptedDate;
use App\Casts\SafeEncryptedArray;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donor extends Model
{
    use HasFactory;

    protected $fillable = [
        'donor_uid', 'name', 'blood_type', 'contact', 'brgy', 'gender', 'dob', 'extra',
    ];

    protected $casts = [
        'name' => SafeEncrypted::class,
        'blood_type' => SafeEncrypted::class,
        'contact' => SafeEncrypted::class,
        'dob' => SafeEncryptedDate::class,
        'brgy' => SafeEncrypted::class,
        'gender' => SafeEncrypted::class,
        'extra' => SafeEncryptedArray::class,
    ];

    public function monitoringRecords()
    {
        return $this->hasMany(MonitoringRecord::class);
    }

    public function monitoringTransactions()
    {
        return $this->hasMany(MonitoringTransaction::class);
    }

    public function toFrontendArray(): array
    {
        return array_merge($this->extra ?? [], [
            'id' => $this->id,
            'name' => $this->name,
            'bloodType' => $this->blood_type,
            'sex' => $this->gender,
            'brgy' => $this->brgy,
            'contact' => $this->contact,
            'avatar' => ($this->extra['avatar'] ?? null) ?: 'picture.jpg',
            'createdAt' => optional($this->created_at)->toDateString(),
        ]);
    }
}
