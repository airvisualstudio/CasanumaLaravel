<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Lead;
use App\Policies\BookingPaymentPolicy;
use App\Policies\BookingPolicy;
use App\Policies\LeadPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(BookingPayment::class, BookingPaymentPolicy::class);
        Gate::policy(Lead::class, LeadPolicy::class);

        Gate::before(function ($user, $ability) {
            return $user->hasRole('superadmin') ? true : null;
        });
    }
}
