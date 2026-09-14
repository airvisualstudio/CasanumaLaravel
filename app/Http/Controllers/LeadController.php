<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $projects = HousingProject::orderBy('name')->get(['id', 'name', 'developer_id']);
        $developers = Developer::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // Fetch sales marketing users (Superadmin and Manager see all; Agent only sees self)
        $isAgentOnly = $user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager']);

        $salesUsers = $isAgentOnly
            ? User::where('id', $user->id)->get(['id', 'name', 'email'])
            : User::role(['sales_agent', 'sales_manager', 'superadmin'])
                ->orderBy('name')
                ->get(['id', 'name', 'email']);

        $query = Lead::with([
            'project:id,name,developer_id',
            'developer:id,name',
            'sales:id,name,email',
        ]);

        $statsBase = Lead::query();

        // RBAC Query Scoping:
        // Sales Agent ONLY sees leads assigned to their own user id
        // Superadmin and Sales Manager can view across all sales agents
        if ($isAgentOnly) {
            $query->where('sales_id', $user->id);
            $statsBase->where('sales_id', $user->id);
        } elseif ($request->filled('sales_id') && $request->sales_id !== 'all') {
            $query->where('sales_id', $request->sales_id);
            $statsBase->where('sales_id', $request->sales_id);
        }

        // Filter by project
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->where('housing_project_id', $request->project_id);
            $statsBase->where('housing_project_id', $request->project_id);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search name, whatsapp, email, nik, address
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('whatsapp', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('nik', 'ilike', "%{$search}%")
                    ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        $leads = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        // Calculate KPI Pipeline Counters (matching current scope & project filter)
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
            'isAgentOnly' => $isAgentOnly,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'developer_id' => 'nullable|exists:developers,id',
            'sales_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'nik' => 'nullable|string|max:30',
            'npwp' => 'nullable|string|max:30',
            'job_type' => 'nullable|string|max:50',
            'monthly_income' => 'nullable|numeric|min:0',
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

        // RBAC Enforcement:
        // Sales Agent cannot assign lead to other agents; forced to own user ID
        if ($user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager'])) {
            $validated['sales_id'] = $user->id;
        } elseif (empty($validated['sales_id'])) {
            $validated['sales_id'] = $user->id;
        }

        $lead = Lead::create($validated);

        ActivityLog::record(
            'create_lead',
            "Menambahkan prospek konsumen baru {$lead->name} ({$lead->whatsapp}) ke pipeline.",
            $lead,
            ['source' => $lead->source, 'sales_id' => $lead->sales_id]
        );

        return redirect()->back()->with('success', 'Data prospek konsumen berhasil ditambahkan ke CRM.');
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        // Enforce Policy
        Gate::authorize('update', $lead);

        $user = $request->user();

        $validated = $request->validate([
            'housing_project_id' => 'required|exists:housing_projects,id',
            'developer_id' => 'nullable|exists:developers,id',
            'sales_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'nik' => 'nullable|string|max:30',
            'npwp' => 'nullable|string|max:30',
            'job_type' => 'nullable|string|max:50',
            'monthly_income' => 'nullable|numeric|min:0',
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

        // RBAC Enforcement:
        // If sales_agent tries to reassign sales_id, preserve original/own sales_id unless manager/superadmin
        if ($user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager'])) {
            $validated['sales_id'] = $lead->sales_id ?? $user->id;
        }

        $lead->update($validated);

        ActivityLog::record(
            'update_lead',
            "Memperbarui informasi data prospek {$lead->name}.",
            $lead
        );

        return redirect()->back()->with('success', 'Data konsumen berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        // Enforce Policy
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,survey_visit,booking,rejected',
        ]);

        $oldStatus = $lead->status;
        $lead->update($validated);

        ActivityLog::record(
            'update_lead_status',
            "Mengubah status pipeline prospek {$lead->name} dari {$oldStatus} menjadi {$lead->status}.",
            $lead,
            ['old_status' => $oldStatus, 'new_status' => $lead->status]
        );

        return redirect()->back()->with('success', "Tahapan status prospek {$lead->name} berhasil diperbarui.");
    }

    public function destroy(Lead $lead): RedirectResponse
    {
        // Enforce Policy
        Gate::authorize('delete', $lead);

        ActivityLog::record(
            'delete_lead',
            "Menghapus data prospek konsumen {$lead->name} ({$lead->whatsapp}).",
            $lead
        );

        $lead->delete();

        return redirect()->back()->with('success', 'Data prospek konsumen berhasil dihapus.');
    }
}
