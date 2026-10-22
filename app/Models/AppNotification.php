<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Casts\SafeEncrypted;
use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'message', 'category', 'is_read'];

    protected $casts = ['message' => SafeEncrypted::class];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toFrontendArray(): array
    {
        return [
            'id' => 'notif_' . $this->id,
            'message' => $this->message,
            'category' => $this->category ?: 'other',
            'timestamp' => optional($this->created_at)->toISOString(),
            'read' => (bool) $this->is_read,
        ];
    }
}
