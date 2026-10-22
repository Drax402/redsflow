<?php

namespace App\Models;

use App\Casts\SafeEncryptedArray;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'avatar_path', 'extra'];

    protected $casts = ['extra' => SafeEncryptedArray::class];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
