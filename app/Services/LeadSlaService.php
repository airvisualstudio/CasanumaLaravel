<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Lead;
use App\Models\LeadInteraction;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class LeadSlaService
{
    /**
     * Detect and revoke leads that have remained in 'new' stage without follow-up
     * for longer than the SLA limit (default: 7 days).
     *
     * @param int $days
     * @return array
     */
    public function revokeInactiveLeads(int $days = 7): array
    {
        $cutoffDate = Carbon::now()->subDays($days);

        $leads = Lead::with('sales')
            ->whereNotNull('sales_id')
            ->where('status', 'new')
            ->where(function ($q) use ($cutoffDate) {
                $q->where(function ($sub) use ($cutoffDate) {
                    $sub->whereNull('last_interaction_at')
                        ->where('created_at', '<=', $cutoffDate);
                })->orWhere('last_interaction_at', '<=', $cutoffDate);
            })
            ->get();

        $revokedDetails = [];

        foreach ($leads as $lead) {
            $oldSales = $lead->sales;
            $oldSalesName = $oldSales ? $oldSales->name : 'Sales Marketing';
            $oldSalesId = $lead->sales_id;

            // Revoke assignment
            $lead->update([
                'sales_id' => null,
                'sla_revoked_at' => now(),
            ]);

            // Add auto-log interaction
            LeadInteraction::create([
                'lead_id' => $lead->id,
                'user_id' => null,
                'channel' => 'other',
                'stage_at_interaction' => 'new',
                'notes' => "Sistem mencabut penugasan dari Sales {$oldSalesName} (SLA Timeout: Tidak ada log follow-up > {$days} hari). Status prospek kembali Unassigned.",
                'interaction_date' => now(),
            ]);

            // Record audit log
            ActivityLog::record(
                'lead_sla_revoked',
                "Penugasan sales {$oldSalesName} untuk prospek {$lead->name} dicabut otomatis oleh sistem (Batas SLA {$days} hari terlewati tanpa follow-up).",
                $lead,
                [
                    'previous_sales_id' => $oldSalesId,
                    'sla_days' => $days,
                    'revoked_at' => now()->toIso8601String(),
                ]
            );

            $revokedDetails[] = [
                'id' => $lead->id,
                'name' => $lead->name,
                'previous_sales' => $oldSalesName,
            ];
        }

        return [
            'count' => count($revokedDetails),
            'leads' => $revokedDetails,
            'sla_days' => $days,
        ];
    }
}
