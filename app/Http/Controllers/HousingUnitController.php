<?php

namespace App\Http\Controllers;

use App\Models\Cluster;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\UnitType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HousingUnitController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = HousingProject::orderBy('name')->get(['id', 'name']);
        $clusters = Cluster::with('project:id,name')->orderBy('name')->get(['id', 'housing_project_id', 'name']);
        $unitTypes = UnitType::with('project:id,name')->orderBy('name')->get(['id', 'housing_project_id', 'name', 'surface_area', 'building_area']);

        $query = HousingUnit::with([
            'cluster.project:id,name',
            'unitType:id,name,surface_area,building_area,bedrooms,bathrooms,brochure_file',
        ]);

        if ($request->filled('project_id')) {
            $query->whereHas('cluster', function ($q) use ($request) {
                $q->where('housing_project_id', $request->project_id);
            });
        }

        if ($request->filled('cluster_id')) {
            $query->where('cluster_id', $request->cluster_id);
        }

        if ($request->filled('unit_type_id')) {
            $query->where('unit_type_id', $request->unit_type_id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('block', 'ilike', "%{$search}%")
                  ->orWhere('unit_number', 'ilike', "%{$search}%")
                  ->orWhere('unit_code', 'ilike', "%{$search}%")
                  ->orWhere('svg_element_id', 'ilike', "%{$search}%");
            });
        }

        $units = $query->orderBy('block')->orderBy('unit_number')->paginate(15)->withQueryString();

        // Inventory summary stats
        $statsQuery = HousingUnit::query();
        if ($request->filled('project_id')) {
            $statsQuery->whereHas('cluster', function ($q) use ($request) {
                $q->where('housing_project_id', $request->project_id);
            });
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'available' => (clone $statsQuery)->where('status', 'available')->count(),
            'booked' => (clone $statsQuery)->where('status', 'booked')->count(),
            'sold' => (clone $statsQuery)->where('status', 'sold')->count(),
            'hold' => (clone $statsQuery)->where('status', 'hold')->count(),
            'total_value' => (clone $statsQuery)->sum('base_price'),
        ];

        return Inertia::render('Properties/Units/Index', [
            'units' => $units,
            'projects' => $projects,
            'clusters' => $clusters,
            'unitTypes' => $unitTypes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'project_id', 'cluster_id', 'unit_type_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cluster_id' => 'required|exists:clusters,id',
            'unit_type_id' => 'required|exists:unit_types,id',
            'block' => 'required|string|max:50',
            'unit_number' => 'required|string|max:50',
            'unit_code' => 'nullable|string|max:100',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:available,booked,sold,hold',
            'svg_element_id' => 'nullable|string|max:100|unique:housing_units,svg_element_id',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['unit_code'])) {
            $validated['unit_code'] = $validated['block'] . '/' . $validated['unit_number'];
        }

        HousingUnit::create($validated);

        return redirect()->back()->with('success', 'Unit kavling berhasil ditambahkan.');
    }

    public function update(Request $request, HousingUnit $housingUnit): RedirectResponse
    {
        $validated = $request->validate([
            'cluster_id' => 'required|exists:clusters,id',
            'unit_type_id' => 'required|exists:unit_types,id',
            'block' => 'required|string|max:50',
            'unit_number' => 'required|string|max:50',
            'unit_code' => 'nullable|string|max:100',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:available,booked,sold,hold',
            'svg_element_id' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('housing_units', 'svg_element_id')->ignore($housingUnit->id),
            ],
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['unit_code'])) {
            $validated['unit_code'] = $validated['block'] . '/' . $validated['unit_number'];
        }

        $housingUnit->update($validated);

        return redirect()->back()->with('success', 'Data unit kavling berhasil diperbarui.');
    }

    public function updateStatus(Request $request, HousingUnit $housingUnit): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:available,booked,sold,hold',
        ]);

        $housingUnit->update($validated);

        return redirect()->back()->with('success', "Status unit {$housingUnit->unit_code} berhasil diubah menjadi {$validated['status']}.");
    }

    public function destroy(HousingUnit $housingUnit): RedirectResponse
    {
        $housingUnit->delete();

        return redirect()->back()->with('success', 'Unit kavling berhasil dihapus.');
    }
}
