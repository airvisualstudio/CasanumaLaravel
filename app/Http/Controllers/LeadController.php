<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Developer;
use App\Models\HousingProject;
use App\Models\Lead;
use App\Models\LeadInteraction;
use App\Models\LeadInteractionNote;
use App\Models\User;
use App\Services\LeadSlaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of leads (Table view).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $projects = HousingProject::orderBy('name')->get(['id', 'name', 'developer_id']);
        $developers = Developer::where('is_active', true)->orderBy('name')->get(['id', 'name']);

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
            'latestInteraction.salesUser:id,name',
            'activeBooking.unit.cluster:id,name,housing_project_id',
            'activeBooking.unit.unitType:id,name',
        ]);

        $statsBase = Lead::query();

        // RBAC Scoping
        if ($isAgentOnly) {
            $query->where('sales_id', $user->id);
            $statsBase->where('sales_id', $user->id);
        } elseif ($request->filled('sales_id') && $request->sales_id !== 'all') {
            $query->where('sales_id', $request->sales_id);
            $statsBase->where('sales_id', $request->sales_id);
        }

        // Project filter
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->where('housing_project_id', $request->project_id);
            $statsBase->where('housing_project_id', $request->project_id);
        }

        // Workspace Pool Segregation (Active Workspace vs Archive & Blacklist Pool)
        $pool = $request->get('pool', 'active');
        if ($pool === 'archived') {
            $query->archivedPool();
        } else {
            $query->active();
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'lost') {
                $query->whereIn('status', ['lost', 'rejected']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Temperature filter
        if ($request->filled('temperature') && in_array($request->temperature, ['hot', 'warm', 'cold'])) {
            $query->where('lead_temperature', $request->temperature);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $likeOp = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, "%{$search}%")
                    ->orWhere('whatsapp', $likeOp, "%{$search}%")
                    ->orWhere('email', $likeOp, "%{$search}%")
                    ->orWhere('nik', $likeOp, "%{$search}%")
                    ->orWhere('source_detail', $likeOp, "%{$search}%")
                    ->orWhere('spouse_name', $likeOp, "%{$search}%")
                    ->orWhere('job_type', $likeOp, "%{$search}%")
                    ->orWhere('company_name', $likeOp, "%{$search}%")
                    ->orWhere('preferred_unit_type', $likeOp, "%{$search}%")
                    ->orWhere('address', $likeOp, "%{$search}%");
            });
        }

        $leads = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $activeCount = (clone $statsBase)->active()->count();
        $archivedCount = (clone $statsBase)->archivedPool()->count();

        // Calculate KPI Pipeline Counters
        $stats = [
            'total' => $pool === 'archived' ? $archivedCount : $activeCount,
            'new' => (clone $statsBase)->where('status', 'new')->count(),
            'contacted' => (clone $statsBase)->where('status', 'contacted')->count(),
            'survey_visit' => (clone $statsBase)->where('status', 'survey_visit')->count(),
            'booking' => (clone $statsBase)->where('status', 'booking')->count(),
            'spk_akad' => (clone $statsBase)->where('status', 'spk_akad')->count(),
            'lost' => (clone $statsBase)->whereIn('status', ['lost', 'rejected'])->count(),
        ];

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'projects' => $projects,
            'developers' => $developers,
            'salesUsers' => $salesUsers,
            'stats' => $stats,
            'pool' => $pool,
            'poolStats' => [
                'active' => $activeCount,
                'archived' => $archivedCount,
            ],
            'filters' => $request->only(['search', 'project_id', 'status', 'sales_id', 'temperature', 'pool']),
            'isAgentOnly' => $isAgentOnly,
        ]);
    }

    /**
     * Display the CRM Pipeline Kanban Board & Follow-up Planner.
     */
    public function pipeline(Request $request): Response
    {
        $user = $request->user();

        $projects = HousingProject::orderBy('name')->get(['id', 'name', 'developer_id']);
        $developers = Developer::where('is_active', true)->orderBy('name')->get(['id', 'name']);

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
            'latestInteraction.salesUser:id,name',
            'activeBooking.unit.cluster:id,name,housing_project_id',
            'activeBooking.unit.unitType:id,name',
        ]);

        $statsBase = Lead::query();

        // Workspace Filter: Exclude archived/dead pool from active pipeline
        $query->where('is_archived', false);
        $statsBase->where('is_archived', false);

        // RBAC Scoping
        if ($isAgentOnly) {
            $query->where('sales_id', $user->id);
            $statsBase->where('sales_id', $user->id);
        } elseif ($request->filled('sales_id') && $request->sales_id !== 'all') {
            $query->where('sales_id', $request->sales_id);
            $statsBase->where('sales_id', $request->sales_id);
        }

        // Project filter
        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->where('housing_project_id', $request->project_id);
            $statsBase->where('housing_project_id', $request->project_id);
        }

        // Reminder filter
        if ($request->filled('reminder')) {
            $today = Carbon::today();
            $now = Carbon::now();

            if ($request->reminder === 'today') {
                $query->whereDate('next_follow_up_date', $today);
            } elseif ($request->reminder === 'overdue') {
                $query->whereNotNull('next_follow_up_date')
                    ->where('next_follow_up_date', '<', $today);
            } elseif ($request->reminder === 'upcoming') {
                $query->where('next_follow_up_date', '>', $now->endOfDay());
            }
        }

        // Temperature filter
        if ($request->filled('temperature') && in_array($request->temperature, ['hot', 'warm', 'cold'])) {
            $query->where('lead_temperature', $request->temperature);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $likeOp = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, "%{$search}%")
                    ->orWhere('whatsapp', $likeOp, "%{$search}%")
                    ->orWhere('email', $likeOp, "%{$search}%")
                    ->orWhere('source_detail', $likeOp, "%{$search}%");
            });
        }

        // Order by priority: overdue/upcoming follow ups first, then latest
        $leads = $query->orderByRaw('CASE WHEN next_follow_up_date IS NOT NULL THEN 0 ELSE 1 END, next_follow_up_date ASC, id DESC')
            ->get();

        // Map status 'rejected' to 'lost' for consistent kanban grouping
        $leads = $leads->map(function ($lead) {
            if ($lead->status === 'rejected') {
                $lead->status = 'lost';
            }

            return $lead;
        });

        $today = Carbon::today();
        $stats = [
            'total' => (clone $statsBase)->count(),
            'new' => (clone $statsBase)->where('status', 'new')->count(),
            'contacted' => (clone $statsBase)->where('status', 'contacted')->count(),
            'survey_visit' => (clone $statsBase)->where('status', 'survey_visit')->count(),
            'booking' => (clone $statsBase)->where('status', 'booking')->count(),
            'spk_akad' => (clone $statsBase)->where('status', 'spk_akad')->count(),
            'lost' => (clone $statsBase)->whereIn('status', ['lost', 'rejected'])->count(),
            'today_reminders' => (clone $statsBase)->whereDate('next_follow_up_date', $today)->count(),
            'overdue_reminders' => (clone $statsBase)->whereNotNull('next_follow_up_date')->where('next_follow_up_date', '<', $today)->count(),
        ];

        return Inertia::render('Leads/Pipeline', [
            'leads' => $leads,
            'projects' => $projects,
            'developers' => $developers,
            'salesUsers' => $salesUsers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'project_id', 'reminder', 'sales_id', 'temperature']),
            'isAgentOnly' => $isAgentOnly,
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
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
            'company_name' => 'nullable|string|max:150',
            'monthly_income' => 'nullable|numeric|min:0',
            'slik_status' => 'nullable|in:clear,ragu,blacklist',
            'marital_status' => 'nullable|in:single,married,divorced',
            'spouse_name' => 'nullable|string|max:150',
            'spouse_nik' => 'nullable|string|max:30',
            'max_budget' => 'nullable|numeric|min:0',
            'preferred_unit_type' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'source' => 'required|string|max:100',
            'source_detail' => 'nullable|string|max:255',
            'lead_temperature' => 'nullable|in:hot,warm,cold',
            'status' => 'nullable|in:new,contacted,survey_visit,booking,spk_akad,lost,rejected',
            'notes' => 'nullable|string',
            'next_follow_up_date' => 'nullable|date',
        ]);

        if (empty($validated['developer_id'])) {
            $project = HousingProject::find($validated['housing_project_id']);
            if ($project) {
                $validated['developer_id'] = $project->developer_id;
            }
        }

        // Anti-Duplikasi WA & NIK per proyek
        $this->validateDuplicateLead($validated);

        // RBAC Auto-assign: if user is sales_agent, strictly assign to own account
        if ($user->hasRole('sales_agent') && ! $user->hasRole(['superadmin', 'sales_manager'])) {
            $validated['sales_id'] = $user->id;
        } elseif (empty($validated['sales_id']) && ! $user->hasRole(['superadmin', 'sales_manager'])) {
            $validated['sales_id'] = $user->id;
        }

        if (empty($validated['status'])) {
            $validated['status'] = 'new';
        }

        if (empty($validated['lead_temperature'])) {
            $validated['lead_temperature'] = 'warm';
        }

        if (empty($validated['slik_status'])) {
            $validated['slik_status'] = 'clear';
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

    /**
     * Update the specified lead in storage.
     */
    public function update(Request $request, Lead $lead): RedirectResponse
    {
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
            'company_name' => 'nullable|string|max:150',
            'monthly_income' => 'nullable|numeric|min:0',
            'slik_status' => 'nullable|in:clear,ragu,blacklist',
            'marital_status' => 'nullable|in:single,married,divorced',
            'spouse_name' => 'nullable|string|max:150',
            'spouse_nik' => 'nullable|string|max:30',
            'max_budget' => 'nullable|numeric|min:0',
            'preferred_unit_type' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'source' => 'required|string|max:100',
            'source_detail' => 'nullable|string|max:255',
            'lead_temperature' => 'nullable|in:hot,warm,cold',
            'status' => 'required|in:new,contacted,survey_visit,booking,spk_akad,lost,rejected',
            'notes' => 'nullable|string',
            'next_follow_up_date' => 'nullable|date',
        ]);

        if (empty($validated['developer_id'])) {
            $project = HousingProject::find($validated['housing_project_id']);
            if ($project) {
                $validated['developer_id'] = $project->developer_id;
            }
        }

        // Anti-Duplikasi WA & NIK per proyek (kecualikan lead saat ini)
        $this->validateDuplicateLead($validated, $lead->id);

        // RBAC Enforcement: Sales agent cannot re-assign or tamper with sales_id
        if (! $user->hasRole(['superadmin', 'sales_manager'])) {
            $validated['sales_id'] = $lead->sales_id ?? $user->id;
        }

        // Audit Log: Track changes to sensitive fields (WhatsApp, Status, Sales PIC, NIK, Nama)
        $sensitiveFields = [
            'whatsapp' => 'No. WhatsApp',
            'status' => 'Status Tahapan',
            'sales_id' => 'Sales PIC',
            'nik' => 'Nomor NIK',
            'name' => 'Nama Konsumen',
        ];

        $sensitiveChanges = [];
        foreach ($sensitiveFields as $field => $label) {
            if ($field === 'sales_id') {
                $oldSalesId = $lead->sales_id;
                $newSalesId = $validated['sales_id'] ?? null;
                if ($oldSalesId != $newSalesId) {
                    $oldName = $lead->sales?->name ?? 'Belum Ditugaskan';
                    $newName = $newSalesId ? (User::find($newSalesId)?->name ?? 'Belum Ditugaskan') : 'Belum Ditugaskan';
                    $sensitiveChanges[] = "{$label}: '{$oldName}' ➔ '{$newName}'";
                }
            } elseif ($field === 'status') {
                if ($lead->status !== $validated['status']) {
                    $oldStatusLabel = self::getStageLabel($lead->status);
                    $newStatusLabel = self::getStageLabel($validated['status']);
                    $sensitiveChanges[] = "{$label}: '{$oldStatusLabel}' ➔ '{$newStatusLabel}'";
                }
            } else {
                $oldVal = (string) ($lead->{$field} ?? '');
                $newVal = (string) ($validated[$field] ?? '');
                if ($oldVal !== $newVal) {
                    $sensitiveChanges[] = "{$label}: '{$oldVal}' ➔ '{$newVal}'";
                }
            }
        }

        $lead->update($validated);

        if (! empty($sensitiveChanges)) {
            $changeSummary = implode(', ', $sensitiveChanges);

            // Record to Activity Log for Superadmin & Managers
            ActivityLog::record(
                'lead_sensitive_updated',
                "Audit Log: Perubahan data sensitif prospek {$lead->name} oleh {$user->name}. Perubahan: {$changeSummary}",
                $lead,
                [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'changes' => $sensitiveChanges,
                ]
            );

            // Record to Lead Interactions timeline so Sales and Managers see the audit security note
            LeadInteraction::create([
                'lead_id' => $lead->id,
                'user_id' => $user->id,
                'channel' => 'system',
                'stage_at_interaction' => $lead->status,
                'notes' => "🛡️ Audit Log: Perubahan data sensitif oleh {$user->name} ({$changeSummary})",
                'interaction_date' => now(),
            ]);
        } else {
            ActivityLog::record(
                'update_lead',
                "Memperbarui informasi data prospek {$lead->name}.",
                $lead
            );
        }

        return redirect()->back()->with('success', 'Data konsumen berhasil diperbarui.');
    }

    /**
     * Archive a lead into the Archive / Blacklist Pool.
     */
    public function archive(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $user = $request->user();

        $lead->update([
            'is_archived' => true,
            'archived_at' => now(),
            'archive_reason' => $validated['reason'],
        ]);

        LeadInteraction::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'channel' => 'system',
            'stage_at_interaction' => $lead->status,
            'notes' => "🗄️ Prospek dipindahkan ke Archive/Blacklist Pool oleh {$user->name}. Alasan: {$validated['reason']}",
            'interaction_date' => now(),
        ]);

        ActivityLog::record(
            'lead_archived',
            "Memindahkan prospek {$lead->name} ke Archive Pool oleh {$user->name}. Alasan: {$validated['reason']}",
            $lead,
            [
                'archived_by' => $user->id,
                'archived_by_name' => $user->name,
                'reason' => $validated['reason'],
            ]
        );

        return redirect()->back()->with('success', "Prospek {$lead->name} berhasil dipindahkan ke Archive Pool.");
    }

    /**
     * Restore a lead from Archive / Blacklist Pool back to Active Workspace.
     */
    public function restore(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $user = $request->user();

        $updates = [
            'is_archived' => false,
            'archived_at' => null,
            'archive_reason' => null,
        ];

        // If lead was in lost or rejected state, restore as contacted
        if (in_array($lead->status, ['lost', 'rejected'])) {
            $updates['status'] = 'contacted';
        }

        // If slik status was blacklist, relax to ragu upon restore
        if ($lead->slik_status === 'blacklist') {
            $updates['slik_status'] = 'ragu';
        }

        $lead->update($updates);

        LeadInteraction::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'channel' => 'system',
            'stage_at_interaction' => $lead->status,
            'notes' => "♻️ Prospek dipulihkan kembali ke Workspace Aktif oleh {$user->name}.",
            'interaction_date' => now(),
        ]);

        ActivityLog::record(
            'lead_restored',
            "Memulihkan prospek {$lead->name} kembali ke Workspace Aktif oleh {$user->name}.",
            $lead,
            [
                'restored_by' => $user->id,
                'restored_by_name' => $user->name,
            ]
        );

        return redirect()->back()->with('success', "Prospek {$lead->name} berhasil dipulihkan ke Workspace Aktif.");
    }

    /**
     * Re-assign lead's sales PIC to another sales marketing agent (Manager & Superadmin only).
     */
    public function reassign(Request $request, Lead $lead)
    {
        Gate::authorize('assign', $lead);

        $validated = $request->validate([
            'sales_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:255',
        ]);

        $newSales = User::findOrFail($validated['sales_id']);
        if (! $newSales->hasRole(['sales_agent', 'sales_manager', 'superadmin'])) {
            throw ValidationException::withMessages([
                'sales_id' => 'Pengguna yang dipilih bukan bagian dari tim sales marketing.',
            ]);
        }

        $oldSalesName = $lead->sales?->name ?? 'Belum Ditugaskan';
        $oldSalesId = $lead->sales_id;

        $lead->update(['sales_id' => $newSales->id]);

        $reasonText = ! empty($validated['reason']) ? " Alasan: {$validated['reason']}." : '';

        ActivityLog::record(
            'lead_reassigned',
            "Menugaskan ulang prospek {$lead->name} dari {$oldSalesName} ke {$newSales->name}.{$reasonText}",
            $lead,
            [
                'old_sales_id' => $oldSalesId,
                'new_sales_id' => $newSales->id,
                'reason' => $validated['reason'] ?? null,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Prospek {$lead->name} berhasil ditugaskan ke {$newSales->name}.",
                'lead' => $lead->fresh(['project:id,name', 'sales:id,name,email']),
            ]);
        }

        return redirect()->back()->with('success', "Prospek {$lead->name} berhasil dialihkan ke {$newSales->name}.");
    }

    /**
     * Check and auto-revoke inactive new leads exceeding the SLA limit (7 days).
     */
    public function checkSla(Request $request, LeadSlaService $slaService): RedirectResponse
    {
        $user = $request->user();
        if (! $user->hasRole(['superadmin', 'sales_manager']) && ! $user->can('assign-leads')) {
            abort(403, 'Anda tidak memiliki otoritas untuk menjalankan audit SLA.');
        }

        $result = $slaService->revokeInactiveLeads(7);
        $count = $result['count'];

        ActivityLog::record(
            'trigger_sla_check',
            "Menjalankan audit SLA prospek inaktif (7 hari). Hasil: {$count} prospek dicabut dan dialihkan ke unassigned.",
            null,
            ['revoked_count' => $count, 'triggered_by' => $user->id]
        );

        return redirect()->back()->with('success', "Pemeriksaan SLA selesai: {$count} prospek inaktif berhasil dicabut dan dikembalikan ke unassigned.");
    }

    /**
     * Clean and normalize Indonesian phone number formats.
     */
    public static function normalizePhone(string $phone): string
    {
        $clean = preg_replace('/\D+/', '', $phone);
        if (str_starts_with($clean, '62')) {
            $clean = '0' . substr($clean, 2);
        } elseif (str_starts_with($clean, '8')) {
            $clean = '0' . $clean;
        }
        return $clean;
    }

    /**
     * Check for duplicate WhatsApp or NIK within the same housing project.
     */
    protected function validateDuplicateLead(array $data, ?int $ignoreLeadId = null): void
    {
        $projectId = $data['housing_project_id'] ?? null;
        if (! $projectId) {
            return;
        }

        // 1. WhatsApp anti-duplication
        if (! empty($data['whatsapp'])) {
            $rawWa = $data['whatsapp'];
            $normWa = static::normalizePhone($rawWa);
            $suffix = strlen($normWa) > 8 ? substr($normWa, -8) : $normWa;

            $existing = Lead::where('housing_project_id', $projectId)
                ->when($ignoreLeadId, fn ($q) => $q->where('id', '!=', $ignoreLeadId))
                ->where(function ($q) use ($rawWa, $normWa, $suffix) {
                    $q->where('whatsapp', $rawWa)
                        ->orWhere('whatsapp', $normWa)
                        ->orWhere('whatsapp', 'like', "%{$suffix}");
                })
                ->with('sales:id,name')
                ->first();

            if ($existing) {
                $salesName = $existing->sales?->name ? "Sales {$existing->sales->name}" : 'Sales Tim';
                throw ValidationException::withMessages([
                    'whatsapp' => "Nomor WhatsApp ({$rawWa}) sudah terdaftar pada proyek ini dan sedang dipegang oleh {$salesName}.",
                ]);
            }
        }

        // 2. NIK anti-duplication (if NIK is provided)
        if (! empty($data['nik'])) {
            $rawNik = trim($data['nik']);
            $existingNik = Lead::where('housing_project_id', $projectId)
                ->when($ignoreLeadId, fn ($q) => $q->where('id', '!=', $ignoreLeadId))
                ->where('nik', $rawNik)
                ->with('sales:id,name')
                ->first();

            if ($existingNik) {
                $salesName = $existingNik->sales?->name ? "Sales {$existingNik->sales->name}" : 'Sales Tim';
                throw ValidationException::withMessages([
                    'nik' => "Nomor NIK ({$rawNik}) sudah terdaftar pada proyek ini atas nama {$existingNik->name} ({$salesName}).",
                ]);
            }
        }
    }

    /**
     * Map pipeline stage key to human readable label.
     */
    public static function getStageLabel(string $stage): string
    {
        return match ($stage) {
            'new' => 'New Lead',
            'contacted' => 'Contacted',
            'survey_visit' => 'Survey Visit',
            'booking' => 'Booking Unit',
            'spk_akad' => 'SPK / Akad',
            'lost', 'rejected' => 'Lost / Batal',
            default => ucfirst($stage),
        };
    }

    /**
     * Update pipeline stage (compatible with Drag-and-Drop Kanban and quick status dialog).
     */
    public function updateStatus(Request $request, Lead $lead)
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,survey_visit,booking,spk_akad,lost,rejected',
            'reason' => 'nullable|string|max:1000',
        ]);

        $newStatus = $validated['status'] === 'rejected' ? 'lost' : $validated['status'];
        $oldStatus = $lead->status;

        // If moved to 'lost', require reason
        if ($newStatus === 'lost' && $oldStatus !== 'lost' && empty($validated['reason'])) {
            return response()->json([
                'success' => false,
                'message' => 'Alasan pembatalan prospek (Lost) wajib diisi.',
                'errors' => ['reason' => ['Alasan pembatalan prospek (Lost) wajib diisi.']],
            ], 422);
        }

        $currentUser = $request->user();
        $oldLabel = self::getStageLabel($oldStatus);
        $newLabel = self::getStageLabel($newStatus);

        $historyNote = "🛡️ Audit Log: Status diubah dari {$oldLabel} ke {$newLabel} oleh Sales {$currentUser->name}.";
        if (! empty($validated['reason'])) {
            $historyNote .= " Alasan: {$validated['reason']}";
        }

        // Auto-record interaction history on stage move
        LeadInteraction::create([
            'lead_id' => $lead->id,
            'user_id' => $currentUser->id,
            'channel' => 'other',
            'stage_at_interaction' => $newStatus,
            'notes' => $historyNote,
            'interaction_date' => now(),
        ]);

        $leadUpdates = [
            'status' => $newStatus,
            'last_interaction_at' => now(),
        ];

        if (! empty($validated['reason'])) {
            $leadUpdates['notes'] = $lead->notes
                ? $lead->notes."\n[Alasan Batal / Lost: {$validated['reason']}]"
                : "[Alasan Batal / Lost: {$validated['reason']}]";
        }

        $lead->update($leadUpdates);

        ActivityLog::record(
            'update_lead_status',
            "Mengubah tahapan pipeline prospek {$lead->name} dari {$oldStatus} menjadi {$newStatus}.".(! empty($validated['reason']) ? " Alasan: {$validated['reason']}" : ''),
            $lead,
            ['old_status' => $oldStatus, 'new_status' => $newStatus, 'reason' => $validated['reason'] ?? null]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Tahapan prospek {$lead->name} berhasil diubah ke {$newLabel}.",
                'lead' => $lead->fresh(['project:id,name', 'sales:id,name']),
            ]);
        }

        return redirect()->back()->with('success', "Tahapan status prospek {$lead->name} berhasil diperbarui.");
    }

    /**
     * Fetch timeline interaction history for a lead.
     */
    public function interactions(Request $request, Lead $lead): JsonResponse
    {
        Gate::authorize('view', $lead);

        $canManageNotes = $request->user() && $request->user()->can('manageInternalNotes', $lead);

        $query = $lead->interactions()->with('salesUser:id,name,email');

        if ($canManageNotes) {
            $query->with(['internalNotes' => function ($q) {
                $q->with('user:id,name,email')->orderBy('created_at', 'asc');
            }]);
        }

        $interactions = $query->orderBy('interaction_date', 'desc')->get();

        return response()->json([
            'lead' => $lead->only([
                'id',
                'name',
                'whatsapp',
                'status',
                'next_follow_up_date',
                'formatted_next_follow_up',
                'next_follow_up_status',
                'slik_status',
                'job_type',
                'company_name',
                'monthly_income',
                'formatted_monthly_income',
                'marital_status',
                'spouse_name',
                'spouse_nik',
                'max_budget',
                'formatted_max_budget',
                'preferred_unit_type',
            ]),
            'interactions' => $interactions,
            'can_manage_notes' => $canManageNotes,
        ]);
    }

    /**
     * Store an internal team note/evaluation comment on a specific follow-up history log.
     */
    public function storeInteractionNote(Request $request, Lead $lead, LeadInteraction $interaction): JsonResponse
    {
        if ((int) $interaction->lead_id !== (int) $lead->id) {
            abort(404, 'Interaksi tidak ditemukan pada data konsumen ini.');
        }

        Gate::authorize('manageInternalNotes', $lead);

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $note = LeadInteractionNote::create([
            'lead_interaction_id' => $interaction->id,
            'user_id' => $request->user()->id,
            'content' => trim($validated['content']),
        ]);

        ActivityLog::record(
            'lead_interaction_internal_note',
            "Menambahkan catatan/arahan internal pada riwayat follow-up konsumen {$lead->name}.",
            $lead,
            [
                'lead_interaction_id' => $interaction->id,
                'note_id' => $note->id,
                'author' => $request->user()->name,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Catatan arahan internal berhasil ditambahkan.',
            'note' => $note->load('user:id,name,email'),
        ], 201);
    }

    /**
     * Store a new follow-up interaction log.
     */
    public function storeInteraction(Request $request, Lead $lead)
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'channel' => 'required|in:whatsapp,phone,meeting,email,other',
            'notes' => 'required|string|max:5000',
            'interaction_date' => 'required|date',
            'stage_at_interaction' => 'nullable|in:new,contacted,survey_visit,booking,spk_akad,lost',
            'next_follow_up_date' => 'nullable|date',
            'next_follow_up_note' => 'nullable|string|max:255',
            'update_stage' => 'nullable|in:new,contacted,survey_visit,booking,spk_akad,lost',
        ]);

        $stage = $validated['update_stage'] ?? $validated['stage_at_interaction'] ?? $lead->status;

        $interaction = LeadInteraction::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'channel' => $validated['channel'],
            'stage_at_interaction' => $stage,
            'notes' => $validated['notes'],
            'interaction_date' => Carbon::parse($validated['interaction_date']),
            'next_follow_up_date' => ! empty($validated['next_follow_up_date']) ? Carbon::parse($validated['next_follow_up_date']) : null,
            'next_follow_up_note' => $validated['next_follow_up_note'] ?? null,
            'is_reminder_completed' => false,
        ]);

        // Update lead tracking columns
        $leadUpdates = [
            'last_interaction_at' => Carbon::parse($validated['interaction_date']),
        ];

        if (array_key_exists('next_follow_up_date', $validated)) {
            $leadUpdates['next_follow_up_date'] = ! empty($validated['next_follow_up_date']) ? Carbon::parse($validated['next_follow_up_date']) : null;
        }

        if (! empty($validated['update_stage']) && $validated['update_stage'] !== $lead->status) {
            $leadUpdates['status'] = $validated['update_stage'];
        }

        $lead->update($leadUpdates);

        ActivityLog::record(
            'lead_follow_up',
            "Mencatat aktivitas follow-up ({$interaction->channel_label}) untuk konsumen {$lead->name}.",
            $lead,
            [
                'channel' => $interaction->channel,
                'interaction_id' => $interaction->id,
                'next_follow_up' => $lead->next_follow_up_date,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Catatan follow-up berhasil disimpan.',
                'interaction' => $interaction->load('salesUser:id,name'),
                'lead' => $lead->fresh(['project:id,name', 'sales:id,name']),
            ]);
        }

        return redirect()->back()->with('success', 'Catatan follow-up berhasil disimpan.');
    }

    /**
     * Remove the specified lead from storage.
     */
    public function destroy(Lead $lead): RedirectResponse
    {
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
