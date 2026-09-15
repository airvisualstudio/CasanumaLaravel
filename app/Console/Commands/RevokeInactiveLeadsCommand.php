<?php

namespace App\Console\Commands;

use App\Services\LeadSlaService;
use Illuminate\Console\Command;

class RevokeInactiveLeadsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leads:revoke-inactive {--days=7 : Batas hari SLA inaktif tanpa follow-up}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Otomatis mencabut penugasan sales pada prospek berstatus New yang tidak memiliki riwayat follow-up melebihi batas waktu SLA (default 7 hari).';

    /**
     * Execute the console command.
     */
    public function handle(LeadSlaService $slaService): int
    {
        $days = (int) $this->option('days');
        if ($days <= 0) {
            $days = 7;
        }

        $this->info("Memeriksa prospek berstatus 'New' dengan inaktivitas > {$days} hari...");

        $result = $slaService->revokeInactiveLeads($days);
        $count = $result['count'];

        if ($count > 0) {
            $this->warn("Berhasil mencabut penugasan {$count} prospek yang melewati batas SLA:");
            foreach ($result['leads'] as $item) {
                $this->line(" - [#{$item['id']}] {$item['name']} (Eks Sales: {$item['previous_sales']})");
            }
        } else {
            $this->info("Tidak ada prospek baru yang melanggar batas SLA.");
        }

        return Command::SUCCESS;
    }
}
