<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use App\Casts\SafeEncryptedArray;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class MonitoringRecord extends Model
{
    use HasFactory;

    protected $fillable = ['record_uid', 'donor_id', 'donation_date', 'blood_type', 'times_donated', 'extra'];

    protected $casts = [
        'donation_date' => 'date',
        'blood_type' => SafeEncrypted::class,
        'extra' => SafeEncryptedArray::class,
    ];

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function toFrontendArray(): array
    {
        return array_merge($this->extra ?? [], [
            'id' => $this->id,
            'donorId' => $this->donor_id,
        ]);
    }

    public function supersedeIntoTransaction(): MonitoringTransaction
    {
        return MonitoringTransaction::create([
            'transaction_uid' => 'txn_' . uniqid(),
            'donor_id' => $this->donor_id,
            'monitoring_record_id' => $this->id,
            'donation_date' => $this->donation_date,
            'blood_type' => $this->blood_type,
            'extra' => $this->extra,
        ]);
    }

    public function syncTransactions(): void
    {
        try {
            if (!$this->donor_id || !Donor::whereKey($this->donor_id)->exists()) {
                return;
            }

            $list = $this->extra['transactions'] ?? [];
            if (!is_array($list)) {
                $list = [];
            }

            MonitoringTransaction::where('monitoring_record_id', $this->id)->delete();

            foreach ($list as $tx) {
                if (!is_array($tx) || empty($tx['date'])) {
                    continue;
                }
                try {
                    $date = Carbon::parse($tx['date'])->toDateString();
                } catch (\Throwable $e) {
                    continue;
                }

                MonitoringTransaction::create([
                    'transaction_uid' => 'txn_' . uniqid('', true),
                    'donor_id' => $this->donor_id,
                    'monitoring_record_id' => $this->id,
                    'donation_date' => $date,
                    'blood_type' => $this->blood_type,
                    'extra' => $tx,
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('syncTransactions failed for record ' . $this->id . ': ' . $e->getMessage());
        }
    }
}
