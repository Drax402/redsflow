<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Database\Eloquent\ComparesCastableAttributes;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;

class SafeEncryptedDate implements CastsAttributes, ComparesCastableAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        if ($value === null || $value === '') {
            return null;
        }
        try {
            $plain = Crypt::decryptString($value);
        } catch (DecryptException $e) {
            $plain = $value;
        }
        try {
            return Carbon::parse($plain);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null || $value === '') {
            return null;
        }
        $plain = $value instanceof \DateTimeInterface ? $value->format('Y-m-d') : Carbon::parse($value)->toDateString();

        return Crypt::encryptString($plain);
    }

    public function compare($model, string $key, $firstValue, $secondValue): bool
    {
        $a = $this->get($model, $key, $firstValue, []);
        $b = $this->get($model, $key, $secondValue, []);

        return ($a?->toDateString()) === ($b?->toDateString());
    }
}
