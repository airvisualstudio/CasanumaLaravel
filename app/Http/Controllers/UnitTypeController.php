<?php

namespace App\Http\Controllers;

use App\Models\UnitType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UnitTypeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'cluster_id' => 'nullable|exists:clusters,id',
            'name' => 'required|string|max:255',
            'surface_area' => 'required|numeric|min:0',
            'building_area' => 'required|numeric|min:0',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'electricity' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'brochure_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('brochure_file')) {
            $path = $request->file('brochure_file')->store('brochures', 'public');
            $validated['brochure_file'] = $path;
        }

        UnitType::create($validated);

        return redirect()->back()->with('success', 'Tipe unit berhasil ditambahkan.');
    }

    public function update(Request $request, UnitType $unitType): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'cluster_id' => 'nullable|exists:clusters,id',
            'name' => 'required|string|max:255',
            'surface_area' => 'required|numeric|min:0',
            'building_area' => 'required|numeric|min:0',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'electricity' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'brochure_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($request->hasFile('brochure_file')) {
            if ($unitType->brochure_file && Storage::disk('public')->exists($unitType->brochure_file)) {
                Storage::disk('public')->delete($unitType->brochure_file);
            }
            $path = $request->file('brochure_file')->store('brochures', 'public');
            $validated['brochure_file'] = $path;
        } else {
            unset($validated['brochure_file']);
        }

        $unitType->update($validated);

        return redirect()->back()->with('success', 'Data tipe unit berhasil diperbarui.');
    }

    public function destroy(UnitType $unitType): RedirectResponse
    {
        if ($unitType->units()->exists()) {
            return redirect()->back()->with('error', 'Tipe unit tidak dapat dihapus karena masih digunakan oleh unit kavling.');
        }

        if ($unitType->brochure_file && Storage::disk('public')->exists($unitType->brochure_file)) {
            Storage::disk('public')->delete($unitType->brochure_file);
        }

        $unitType->delete();

        return redirect()->back()->with('success', 'Tipe unit berhasil dihapus.');
    }
}
