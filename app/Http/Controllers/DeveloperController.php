<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Developer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeveloperController extends Controller
{
    /**
     * Store a newly created developer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:50'],
            'office_address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:100'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('developers', 'public');
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        $developer = Developer::create($validated);

        ActivityLog::record(
            'developer_create',
            "Menambahkan Developer/PT baru: {$developer->name}",
            $developer,
            ['name' => $developer->name, 'npwp' => $developer->npwp]
        );

        return redirect()->route('properties.index', ['tab' => 'developers'])
            ->with('success', "Developer PT {$developer->name} berhasil ditambahkan!");
    }

    /**
     * Update the specified developer in storage.
     */
    public function update(Request $request, Developer $developer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:50'],
            'office_address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:100'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            if ($developer->logo && Storage::disk('public')->exists($developer->logo)) {
                Storage::disk('public')->delete($developer->logo);
            }
            $validated['logo'] = $request->file('logo')->store('developers', 'public');
        }

        $validated['is_active'] = $request->boolean('is_active', true);

        $developer->update($validated);

        ActivityLog::record(
            'developer_update',
            "Memperbarui data Developer/PT: {$developer->name}",
            $developer,
            ['name' => $developer->name]
        );

        return redirect()->route('properties.index', ['tab' => 'developers'])
            ->with('success', "Data Developer PT {$developer->name} berhasil diperbarui!");
    }

    /**
     * Remove the specified developer from storage.
     */
    public function destroy(Developer $developer): RedirectResponse
    {
        $name = $developer->name;

        // Clean up logo if stored
        if ($developer->logo && Storage::disk('public')->exists($developer->logo)) {
            Storage::disk('public')->delete($developer->logo);
        }

        // Clean up project banner images before deleting developer
        foreach ($developer->projects as $project) {
            if ($project->banner_image && Storage::disk('public')->exists($project->banner_image)) {
                Storage::disk('public')->delete($project->banner_image);
            }
        }

        $developer->delete();

        ActivityLog::record(
            'developer_delete',
            "Menghapus Developer/PT: {$name}",
            null,
            ['name' => $name]
        );

        return redirect()->route('properties.index', ['tab' => 'developers'])
            ->with('success', "Developer PT {$name} berhasil dihapus!");
    }
}
