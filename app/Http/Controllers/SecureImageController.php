<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ImageCryptoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SecureImageController extends Controller
{
    protected const FIELD_MAP = [
        'id_front' => 'id_front_path',
        'id_back' => 'id_back_path',
        'face_doc' => 'face_doc_path',
    ];

    public function show(Request $request, int $userId, string $field, ImageCryptoService $crypto)
    {
        if (!isset(self::FIELD_MAP[$field])) {
            abort(404);
        }

        $viewer = Auth::user();
        if (!$viewer || (!$viewer->hasRoleAdmin() && $viewer->id !== $userId)) {
            abort(403);
        }

        $target = User::findOrFail($userId);
        $path = $target->{self::FIELD_MAP[$field]};
        if (!$path) {
            abort(404);
        }

        $bytes = $crypto->decrypt($path);
        if ($bytes === null) {
            abort(404);
        }

        $mime = 'image/jpeg';
        if (str_starts_with($bytes, "\x89PNG")) {
            $mime = 'image/png';
        } elseif (str_starts_with($bytes, 'RIFF') && substr($bytes, 8, 4) === 'WEBP') {
            $mime = 'image/webp';
        }

        return response($bytes, 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'private, no-store');
    }
}
