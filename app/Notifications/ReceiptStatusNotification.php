<?php

namespace App\Notifications;

use App\Models\Receipt;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReceiptStatusNotification extends Notification
{
    use Queueable;

    public Receipt $receipt;
    public string $status;
    public string $message;

    public function __construct(Receipt $receipt, string $status, string $message)
    {
        $this->receipt = $receipt;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $receiptNumber = $this->receipt->receipt_number 
            ?? $this->receipt->finance_receipt_number 
            ?? ('#RC-' . str_pad((string) $this->receipt->id, 4, '0', STR_PAD_LEFT));

        $bookingCode = $this->receipt->booking?->booking_code ?? '-';
        $customerName = $this->receipt->lead?->name ?? $this->receipt->booking?->lead?->name ?? '-';

        return [
            'receipt_id' => $this->receipt->id,
            'receipt_number' => $receiptNumber,
            'status' => $this->status,
            'title' => 'Update Kwitansi: ' . $receiptNumber,
            'message' => $this->message,
            'amount' => (float) $this->receipt->amount,
            'formatted_amount' => $this->receipt->formatted_amount,
            'booking_code' => $bookingCode,
            'customer_name' => $customerName,
            'action_url' => route('receipts.index', ['receipt_id' => $this->receipt->id]),
            'icon' => match ($this->status) {
                Receipt::STATUS_SUBMITTED => 'FileText',
                Receipt::STATUS_FINANCE_REVIEW, Receipt::STATUS_FINANCE_APPROVED => 'CheckCircle2',
                Receipt::STATUS_MANAGER_APPROVED => 'Award',
                Receipt::STATUS_REJECTED => 'XCircle',
                default => 'Bell',
            },
            'color' => match ($this->status) {
                Receipt::STATUS_SUBMITTED => 'yellow',
                Receipt::STATUS_FINANCE_REVIEW => 'blue',
                Receipt::STATUS_FINANCE_APPROVED => 'indigo',
                Receipt::STATUS_MANAGER_APPROVED => 'green',
                Receipt::STATUS_REJECTED => 'red',
                default => 'gray',
            },
        ];
    }
}
