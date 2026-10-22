<?php

namespace App\Models;

use App\Casts\SafeEncrypted;
use Illuminate\Database\Eloquent\Model;

class BloodTransfer extends Model
{
    protected $fillable = [
        'kind', 'blood_bag_id', 'bag_code', 'component', 'blood_type', 'destination', 'patient_name', 'reason', 'remarks',
        'transferred_on', 'recorded_by', 'recorded_by_name',
    ];

    protected $casts = [
        'blood_type' => SafeEncrypted::class,
        'patient_name' => SafeEncrypted::class,
        'transferred_on' => 'date',
    ];

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'bagId' => $this->bag_code,
            'component' => $this->component,
            'bloodType' => $this->blood_type,
            'destination' => $this->destination,
            'patientName' => $this->patient_name,
            'reason' => $this->reason,
            'remarks' => $this->remarks,
            'transferredOn' => optional($this->transferred_on)->toDateString(),
            'recordedBy' => $this->recorded_by_name,
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
