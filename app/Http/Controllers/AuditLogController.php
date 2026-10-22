<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index()
    {
        $entries = AuditLog::whereNotNull('action_label')
            ->orderByDesc('logged_at')
            ->limit(200)
            ->get()
            ->map->toFrontendArray();

        return response()->json(['entries' => $entries]);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        AuditLog::whereIn('id', $ids)->delete();

        return response()->json(['deleted' => count($ids)]);
    }

    public function clear()
    {
        AuditLog::whereNotNull('action_label')->delete();

        return response()->json(['message' => 'Cleared.']);
    }
}
