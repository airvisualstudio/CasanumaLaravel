<?php

namespace App\Http\Controllers;

use App\Models\Cluster;
use App\Models\HousingProject;
use App\Models\HousingUnit;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SiteplanController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = HousingProject::orderBy('name')->get(['id', 'name', 'siteplan_svg']);

        $selectedProjectId = $request->input('project_id', $projects[0]?->id ?? null);
        $clusters = [];
        $selectedClusterId = $request->input('cluster_id', null);

        if ($selectedProjectId) {
            $clusters = Cluster::where('housing_project_id', $selectedProjectId)
                ->orderBy('name')
                ->get(['id', 'housing_project_id', 'name', 'siteplan_svg']);
        }

        $activeProject = HousingProject::find($selectedProjectId);
        $activeCluster = $selectedClusterId ? Cluster::find($selectedClusterId) : ($clusters[0] ?? null);

        // Determine SVG source: cluster level first, fallback to project level
        $svgUrl = $activeCluster?->siteplan_svg_url ?? $activeProject?->siteplan_svg_url;

        // Fetch housing units under this cluster / project
        $unitsQuery = HousingUnit::with([
            'unitType:id,name,surface_area,building_area,bedrooms,bathrooms,brochure_file',
            'cluster:id,name,housing_project_id',
            'activeBooking.lead:id,name,whatsapp,email',
            'activeBooking.sales:id,name,email',
        ]);

        if ($activeCluster) {
            $unitsQuery->where('cluster_id', $activeCluster->id);
        } elseif ($selectedProjectId) {
            $unitsQuery->whereHas('cluster', function ($q) use ($selectedProjectId) {
                $q->where('housing_project_id', $selectedProjectId);
            });
        }

        $units = $unitsQuery->get();

        // Leads for quick booking modal
        $leads = Lead::where('status', '!=', 'rejected')->orderBy('name')->get(['id', 'name', 'whatsapp', 'housing_project_id']);
        $salesUsers = User::role(['sales_agent', 'sales_manager', 'superadmin'])->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Properties/Siteplan/Index', [
            'projects' => $projects,
            'clusters' => $clusters,
            'activeProject' => $activeProject,
            'activeCluster' => $activeCluster,
            'svgUrl' => $svgUrl,
            'units' => $units,
            'leads' => $leads,
            'salesUsers' => $salesUsers,
            'filters' => [
                'project_id' => $selectedProjectId,
                'cluster_id' => $activeCluster?->id,
            ],
        ]);
    }

    public function uploadSvg(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'target_type' => 'required|in:project,cluster',
            'target_id' => 'required|integer',
            'svg_file' => 'required|file|mimes:svg,xml|max:5120',
        ]);

        $path = $request->file('svg_file')->store('siteplans', 'public');

        if ($validated['target_type'] === 'project') {
            $project = HousingProject::findOrFail($validated['target_id']);
            if ($project->siteplan_svg && Storage::disk('public')->exists($project->siteplan_svg)) {
                Storage::disk('public')->delete($project->siteplan_svg);
            }
            $project->update(['siteplan_svg' => $path]);
        } else {
            $cluster = Cluster::findOrFail($validated['target_id']);
            if ($cluster->siteplan_svg && Storage::disk('public')->exists($cluster->siteplan_svg)) {
                Storage::disk('public')->delete($cluster->siteplan_svg);
            }
            $cluster->update(['siteplan_svg' => $path]);
        }

        return redirect()->back()->with('success', 'File denah siteplan SVG berhasil diunggah!');
    }
}
