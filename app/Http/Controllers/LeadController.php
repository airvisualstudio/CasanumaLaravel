<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $projects = HousingProject::orderBy('name')->get(['id', 'name', 'developer_id']);
        $developers = Developer::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // Fetch sales marketing users
        $salesUsers = User::role(['sales_agent', 'sales_manager', 'superadmin'])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $query = Lead::with([
            'project:id,name,developer_id',
            'developer:id,name',
            'sales:id,name,email',
        ]);

        // Filter by project
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->where('housing_project_id', $request->project_id);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by sales
        if ($request->filled('sales_id') && $request->sales_id !== 'all') {
            $query->where('sales_id', $request->sales_id);
        }

        // Search name, whatsapp, email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('whatsapp', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        $leads = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Calculate KPI Pipeline Counters (matching current project filter if set)
        $statsBase = Lead::query();
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $statsBase->where('housing_project_id', $request->project_id);
        }

        $stats = [
            'total' => (clone $statsBase)->count(),
            'new' => (clone $statsBase)->where('status', 'new')->count(),
            'contacted' => (clone $statsBase)->where('status', 'contacted')->count(),
            'survey_visit' => (clone $statsBase)->where('status', 'survey_visit')->count(),
            'booking' => (clone $statsBase)->where('status', 'booking')->count(),
            'rejected' => (clone $statsBase)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'projects' => $projects,
            'developers' => $developers,
            'salesUsers' => $salesUsers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'project_id', 'status', 'sales_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'developer_id' => 'nullable|exists:developers,id',
            'sales_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'source' => 'required|string|max:100',
            'status' => 'required|in:new,contacted,survey_visit,booking,rejected',
            'notes' => 'nullable|string',
        ]);

        // If developer_id is not specified, inherit from housing_project
        if (empty($validated['developer_id'])) {
            $project = HousingProject::find($validated['housing_project_id']);
            if ($project) {
                $validated['developer_id'] = $project->developer_id;
            }
        }

        // Default sales to current user if they are a sales_agent and not selected
        if (empty($validated['sales_id']) && $request->user()->hasRole('sales_agent')) {
            $validated['sales_id'] = $request->user()->id;
        }

        Lead::create($validated);

        return redirect()->back()->with('success', 'Data prospek konsumen berhasil ditambahkan ke CRM.');
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'developer_id' => 'nullable|exists:developers,id',
            'sales_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'source' => 'required|string|max:100',
            'status' => 'required|in:new,contacted,survey_visit,booking,rejected',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['developer_id'])) {
            $project = HousingProject::find($validated['housing_project_id']);
            if ($project) {
                $validated['developer_id'] = $project->developer_id;
            }
        }

        $lead->update($validated);

        return redirect()->back()->with('success', 'Data konsumen berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,survey_visit,booking,rejected',
        ]);

        $lead->update($validated);

        return redirect()->back()->with('success', "Tahapan status prospek {$lead->name} berhasil diperbarui.");
    }

    public function destroy(Lead $lead): RedirectResponse
    {
        $lead->delete();

        return redirect()->back()->with('success', 'Data prospek konsumen berhasil dihapus.');
    }
}
