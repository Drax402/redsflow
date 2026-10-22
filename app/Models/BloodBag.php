<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class BloodBag extends Model
{
    public const COMPONENTS = [
        'Whole Blood' => ['days' => 35, 'soon' => 3, 'watch' => 7, 'kind' => 'fridge'],
        'Red Cells' => ['days' => 42, 'soon' => 3, 'watch' => 7, 'kind' => 'fridge'],
        'Platelets' => ['days' => 5, 'soon' => 1, 'watch' => 2, 'kind' => 'agitator'],
        'Plasma' => ['days' => 365, 'soon' => 14, 'watch' => 30, 'kind' => 'freezer'],
    ];

    protected $fillable = [
        'bag_uid', 'bag_code', 'blood_center', 'storage_unit_id', 'donor_id', 'donor_name', 'blood_type', 'component', 'units', 'collected_on', 'expires_on',
        'result', 'storage_location', 'shelf', 'status', 'alerted_level', 'closed_at', 'recorded_by',
    ];

    protected $casts = [
        'donor_name' => SafeEncrypted::class,
        'blood_type' => SafeEncrypted::class,
        'collected_on' => 'date',
        'expires_on' => 'date',
        'closed_at' => 'datetime',
    ];

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function unit()
    {
        return $this->belongsTo(StorageUnit::class, 'storage_unit_id');
    }

    public static function locationHint(string $component): string
    {
        return [
            'fridge' => 'Whole Blood and Red Cells must be stored in a refrigerator.',
            'agitator' => 'Platelets must be stored in a platelet agitator.',
            'freezer' => 'Plasma must be stored in a freezer.',
        ][self::COMPONENTS[$component]['kind'] ?? 'fridge'];
    }

    public function daysLeft(): int
    {
        return (int) Carbon::today()->diffInDays($this->expires_on, false);
    }

    public function expiryLevel(): int
    {
        if ($this->status !== 'In Stock') {
            return 0;
        }
        $left = $this->daysLeft();
        if ($left < 0) {
            return 3;
        }
        $cfg = self::COMPONENTS[$this->component] ?? ['soon' => 3, 'watch' => 7];
        if ($left <= $cfg['soon']) {
            return 2;
        }

        return $left <= $cfg['watch'] ? 1 : 0;
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'bagId' => $this->bag_code,
            'bloodCenter' => $this->blood_center,
            'donorId' => $this->donor_id,
            'donorName' => $this->donor_name,
            'bloodType' => $this->blood_type,
            'component' => $this->component,
            'units' => $this->units,
            'collectedOn' => optional($this->collected_on)->toDateString(),
            'expiresOn' => optional($this->expires_on)->toDateString(),
            'result' => $this->result,
            'storageUnitId' => $this->storage_unit_id,
            'storageLocation' => $this->unit ? $this->unit->label() : $this->storage_location,
            'shelf' => $this->shelf,
            'status' => $this->status,
            'daysLeft' => $this->daysLeft(),
            'level' => $this->expiryLevel(),
            'closedAt' => optional($this->closed_at)->toISOString(),
        ];
    }
}
