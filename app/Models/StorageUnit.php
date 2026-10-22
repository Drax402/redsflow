<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorageUnit extends Model
{
    public const KINDS = ['fridge', 'freezer', 'agitator'];

    public const BASE_NAMES = ['fridge' => 'Refrigerator', 'agitator' => 'Platelet Agitator', 'freezer' => 'Freezer'];
    public const DEFAULT_TEMPS = ['fridge' => '2-6 C', 'agitator' => '20-24 C', 'freezer' => '-18 C or colder'];

    protected $fillable = ['name', 'temperature', 'kind'];

    public static function nextName(string $kind): string
    {
        $base = self::BASE_NAMES[$kind];
        $used = [];
        foreach (self::where('name', 'like', $base . '%')->pluck('name') as $existing) {
            if (preg_match('/^' . preg_quote($base, '/') . '(?:\s+(\d+))?$/i', trim($existing), $m)) {
                $used[isset($m[1]) ? (int) $m[1] : 1] = true;
            }
        }
        $i = 1;
        while (isset($used[$i])) {
            $i++;
        }

        return $base . ' ' . $i;
    }

    public function bags()
    {
        return $this->hasMany(BloodBag::class);
    }

    public function label(): string
    {
        return $this->name . ' (' . $this->temperature . ')';
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'temperature' => $this->temperature,
            'kind' => $this->kind,
            'label' => $this->label(),
            'inStock' => $this->bags()->where('status', 'In Stock')->count(),
        ];
    }
}
