<?php

namespace App\Http\Controllers;

use App\Models\Cluster;
use App\Models\HousingProject;
use App\Models\UnitType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClusterController extends Controller
{
    public function index(Request $request): Response
    {
        $housingProjects = HousingProject::orderBy('name')->get(['id', 'name']);

        $clustersQuery = Cluster::with(['project:id,name'])
            ->withCount('units');

        if ($request->filled('project_id')) {
            $clustersQuery->where('housing_project_id', $request->project_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $clustersQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $clusters = $clustersQuery->orderBy('id', 'desc')->get();

        $unitTypesQuery = UnitType::with(['project:id,name', 'cluster:id,name'])
            ->withCount('units');

        if ($request->filled('project_id')) {
            $unitTypesQuery->where('housing_project_id', $request->project_id);
        }

        $unitTypes = $unitTypesQuery->orderBy('id', 'desc')->get();

        return Inertia::render('Properties/Clusters/Index', [
            'clusters' => $clusters,
            'unitTypes' => $unitTypes,
            'projects' => $housingProjects,
            'filters' => $request->only(['search', 'project_id', 'tab']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Cluster::create($validated);

        return redirect()->back()->with('success', 'Cluster berhasil ditambahkan.');
    }

    public function update(Request $request, Cluster $cluster): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $cluster->update($validated);

        return redirect()->back()->with('success', 'Data cluster berhasil diperbarui.');
    }

    public function destroy(Cluster $cluster): RedirectResponse
    {
        if ($cluster->units()->exists()) {
            return redirect()->back()->with('error', 'Cluster tidak dapat dihapus karena masih memiliki unit kavling terkait.');
        }

        $cluster->delete();

        return redirect()->back()->with('success', 'Cluster berhasil dihapus.');
    }
}
