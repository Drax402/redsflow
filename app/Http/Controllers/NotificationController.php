<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifs = AppNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map->toFrontendArray();

        return response()->json([
            'notifications' => [$user->uuid => $notifs],
        ]);
    }

    public function destroy(Request $request, string $notifId)
    {
        $id = str_replace('notif_', '', $notifId);
        AppNotification::where('user_id', $request->user()->id)->where('id', $id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function setRead(Request $request, string $notifId)
    {
        $data = $request->validate(['read' => 'required|boolean']);
        $id = str_replace('notif_', '', $notifId);

        $updated = AppNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->update(['is_read' => (bool) $data['read']]);

        if (!$updated && !AppNotification::where('user_id', $request->user()->id)->where('id', $id)->exists()) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        return response()->json(['message' => 'Updated.', 'read' => (bool) $data['read']]);
    }

    public function clear(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Cleared.']);
    }
}
