<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use App\Casts\SafeEncryptedArray;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonitoringTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['transaction_uid', 'donor_id', 'monitoring_record_id', 'donation_date', 'blood_type', 'extra'];

    protected $casts = [
        'donation_date' => 'date',
        'blood_type' => SafeEncrypted::class,
        'extra' => SafeEncryptedArray::class,
    ];

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }
}
