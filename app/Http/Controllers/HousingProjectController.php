<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\HousingProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HousingProjectController extends Controller
{
    /**
     * Store a newly created housing project in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'developer_id' => ['required', 'exists:developers,id'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'area_size' => ['nullable', 'numeric', 'min:0'],
            'area_unit' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:planning,active,sold_out'],
            'banner_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        if ($request->hasFile('banner_image')) {
            $validated['banner_image'] = $request->file('banner_image')->store('projects', 'public');
        }

        if (empty($validated['area_unit'])) {
            $validated['area_unit'] = 'm²';
        }

        $project = HousingProject::create($validated);

        ActivityLog::record(
            'project_create',
            "Menambahkan Proyek Perumahan baru: {$project->name}",
            $project,
            ['name' => $project->name, 'city' => $project->city, 'developer_id' => $project->developer_id]
        );

        return redirect()->route('properties.index', ['tab' => 'projects'])
            ->with('success', "Proyek {$project->name} berhasil ditambahkan!");
    }

    /**
     * Update the specified housing project in storage.
     */
    public function update(Request $request, HousingProject $housingProject): RedirectResponse
    {
        $validated = $request->validate([
            'developer_id' => ['required', 'exists:developers,id'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'area_size' => ['nullable', 'numeric', 'min:0'],
            'area_unit' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:planning,active,sold_out'],
            'banner_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        if ($request->hasFile('banner_image')) {
            if ($housingProject->banner_image && Storage::disk('public')->exists($housingProject->banner_image)) {
                Storage::disk('public')->delete($housingProject->banner_image);
            }
            $validated['banner_image'] = $request->file('banner_image')->store('projects', 'public');
        }

        if (empty($validated['area_unit'])) {
            $validated['area_unit'] = 'm²';
        }

        $housingProject->update($validated);

        ActivityLog::record(
            'project_update',
            "Memperbarui data Proyek Perumahan: {$housingProject->name}",
            $housingProject,
            ['name' => $housingProject->name, 'city' => $housingProject->city]
        );

        return redirect()->route('properties.index', ['tab' => 'projects'])
            ->with('success', "Data Proyek {$housingProject->name} berhasil diperbarui!");
    }

    /**
     * Remove the specified housing project from storage.
     */
    public function destroy(HousingProject $housingProject): RedirectResponse
    {
        $name = $housingProject->name;

        if ($housingProject->banner_image && Storage::disk('public')->exists($housingProject->banner_image)) {
            Storage::disk('public')->delete($housingProject->banner_image);
        }

        $housingProject->delete();

        ActivityLog::record(
            'project_delete',
            "Menghapus Proyek Perumahan: {$name}",
            null,
            ['name' => $name]
        );

        return redirect()->route('properties.index', ['tab' => 'projects'])
            ->with('success', "Proyek {$name} berhasil dihapus!");
    }
}
