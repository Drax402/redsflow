<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\StorageUnit;
use App\Support\ChangeDiff;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StorageUnitController extends Controller
{
    public function index()
    {
        return response()->json(['units' => StorageUnit::orderByRaw("FIELD(kind, 'fridge', 'agitator', 'freezer')")->orderBy('name')->orderBy('id')->get()->map->toFrontendArray()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'preset' => ['nullable', Rule::in(StorageUnit::KINDS)],
            'name' => 'nullable|string|max:60',
            'temperature' => 'nullable|string|max:40',
            'kind' => ['nullable', Rule::in(StorageUnit::KINDS)],
        ]);

        if (!empty($data['preset'])) {
            $kind = $data['preset'];
            $name = StorageUnit::nextName($kind);
            $temperature = StorageUnit::DEFAULT_TEMPS[$kind];
        } else {
            $name = trim((string) ($data['name'] ?? ''));
            $temperature = trim((string) ($data['temperature'] ?? ''));
            $kind = (string) ($data['kind'] ?? '');
            if ($name === '' || $temperature === '' || !in_array($kind, StorageUnit::KINDS, true)) {
                return response()->json(['message' => 'Please fill in the Name, Type and Temperature.'], 422);
            }
            if (StorageUnit::where('name', $name)->exists()) {
                return response()->json(['message' => 'A storage unit with this name already exists. Please use a different name.'], 422);
            }
        }

        $unit = StorageUnit::create([
            'name' => $name,
            'temperature' => $temperature,
            'kind' => $kind,
        ]);

        AuditLog::recordDonorAction($request->user()?->id, 'Create', null, 'Storage: ' . $unit->name, 'Storage unit added: ' . $unit->label() . '.');

        return response()->json(['unit' => $unit->toFrontendArray()], 201);
    }

    public function update(Request $request, StorageUnit $unit)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', Rule::unique('storage_units', 'name')->ignore($unit->id)],
            'temperature' => 'required|string|max:40',
        ]);

        $before = ['name' => $unit->name, 'temperature' => $unit->temperature];
        $after = ['name' => trim($data['name']), 'temperature' => trim($data['temperature'])];
        $parts = [];
        foreach (['name' => 'Name', 'temperature' => 'Temperature'] as $key => $label) {
            if ($before[$key] !== $after[$key]) {
                $parts[] = $label . ': ' . $before[$key] . ' > ' . $after[$key];
            }
        }

        $unit->update($after);

        if ($parts) {
            AuditLog::recordDonorAction($request->user()?->id, 'Update', null, 'Storage: ' . $before['name'], ChangeDiff::format($parts));
        }

        return response()->json(['unit' => $unit->toFrontendArray()]);
    }

    public function destroy(Request $request, StorageUnit $unit)
    {
        $inStock = $unit->bags()->where('status', 'In Stock')->count();
        if ($inStock > 0) {
            return response()->json(['message' => "This storage unit still has {$inStock} bag" . ($inStock === 1 ? '' : 's') . ' inside. Move or dispose them first.'], 422);
        }

        $label = $unit->label();
        $unit->bags()->update(['storage_location' => $label]);
        $unit->delete();

        AuditLog::recordDonorAction($request->user()?->id, 'Delete', null, 'Storage: ' . $unit->name, 'Storage unit deleted: ' . $label . '.');

        return response()->json(['ok' => true]);
    }
}
