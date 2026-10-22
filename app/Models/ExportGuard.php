<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExportGuard extends Model
{
    protected $fillable = ['user_id', 'failed_attempts', 'locked_until', 'exports'];

    protected $casts = [
        'locked_until' => 'datetime',
        'exports' => 'array',
    ];
}
