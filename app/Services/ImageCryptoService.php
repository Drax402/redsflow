<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageCryptoService
{
    public function storeEncrypted(?string $base64DataUrl, string $folder): ?string
    {
        if (empty($base64DataUrl)) {
            return null;
        }

        if (str_contains($base64DataUrl, ',')) {
            [, $base64DataUrl] = explode(',', $base64DataUrl, 2);
        }

        $rawBytes = base64_decode($base64DataUrl, true);
        if ($rawBytes === false) {
            return null;
        }

        $encrypted = Crypt::encrypt($rawBytes);
        $path = trim($folder, '/') . '/' . Str::uuid() . '.enc';

        if (Schema::hasTable('secure_files')) {
            DB::table('secure_files')->insert([
                'path' => $path,
                'content' => $encrypted,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return $path;
        }

        Storage::disk('secure')->put($path, $encrypted);

        return $path;
    }

    public function decrypt(string $storedPath): ?string
    {
        try {
            if (Schema::hasTable('secure_files')) {
                $row = DB::table('secure_files')->where('path', $storedPath)->first();
                if ($row) {
                    return Crypt::decrypt($row->content);
                }
            }

            if (Storage::disk('secure')->exists($storedPath)) {
                return Crypt::decrypt(Storage::disk('secure')->get($storedPath));
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }

    public function delete(?string $storedPath): void
    {
        if (empty($storedPath)) {
            return;
        }

        try {
            if (Schema::hasTable('secure_files')) {
                DB::table('secure_files')->where('path', $storedPath)->delete();
            }
            if (Storage::disk('secure')->exists($storedPath)) {
                Storage::disk('secure')->delete($storedPath);
            }
        } catch (\Exception $e) {
        }
    }
}
