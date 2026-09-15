<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\HousingProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyMasterController extends Controller
{
    /**
     * Display the Property Master index page (Developers & Housing Projects).
     */
    public function index(Request $request): Response
    {
        $developers = Developer::withCount('projects')
            ->orderBy('name', 'asc')
            ->get();

        $projects = HousingProject::with('developer:id,name,logo')
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_developers' => $developers->count(),
            'active_developers' => $developers->where('is_active', true)->count(),
            'total_projects' => $projects->count(),
            'active_projects' => $projects->where('status', 'active')->count(),
            'total_area_sqm' => (float) $projects->sum(function ($proj) {
                if ($proj->area_unit === 'Ha' || $proj->area_unit === 'ha') {
                    return ((float) $proj->area_size) * 10000;
                }

                return (float) $proj->area_size;
            }),
        ];

        return Inertia::render('Properties/Index', [
            'developers' => $developers,
            'projects' => $projects,
            'stats' => $stats,
            'activeTab' => $request->query('tab', 'developers'),
        ]);
    }
}
