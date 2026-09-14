<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClusterController;
use App\Http\Controllers\DeveloperController;
use App\Http\Controllers\GeneralSettingController;
use App\Http\Controllers\HousingProjectController;
use App\Http\Controllers\HousingUnitController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyMasterController;
use App\Http\Controllers\SiteplanController;
use App\Http\Controllers\UnitTypeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// User Management & Settings (Protected by Spatie RBAC: Only Superadmin)
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::match(['put', 'post'], '/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::patch('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Settings: General Branding, Activity Logs & Telegram Integration
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/general', [GeneralSettingController::class, 'index'])->name('general.index');
        Route::post('/general', [GeneralSettingController::class, 'update'])->name('general.update');
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::post('/telegram', [ActivityLogController::class, 'updateTelegramSettings'])->name('telegram.update');
        Route::post('/telegram/test', [ActivityLogController::class, 'testTelegramConnection'])->name('telegram.test');
    });
});

// Master Properti: Developer & Proyek Perumahan
Route::middleware(['auth', 'can:view-units'])->group(function () {
    Route::get('/properties', [PropertyMasterController::class, 'index'])->name('properties.index');

    Route::middleware('can:create-units')->group(function () {
        Route::post('/developers', [DeveloperController::class, 'store'])->name('developers.store');
        Route::match(['put', 'post'], '/developers/{developer}', [DeveloperController::class, 'update'])->name('developers.update');
        Route::delete('/developers/{developer}', [DeveloperController::class, 'destroy'])->name('developers.destroy');

        Route::post('/housing-projects', [HousingProjectController::class, 'store'])->name('housing-projects.store');
        Route::match(['put', 'post'], '/housing-projects/{housingProject}', [HousingProjectController::class, 'update'])->name('housing-projects.update');
        Route::delete('/housing-projects/{housingProject}', [HousingProjectController::class, 'destroy'])->name('housing-projects.destroy');
    });

    // Cluster & Site Plan
    Route::get('/clusters', [ClusterController::class, 'index'])->name('clusters.index');
    Route::middleware('can:create-units')->group(function () {
        Route::post('/clusters', [ClusterController::class, 'store'])->name('clusters.store');
        Route::put('/clusters/{cluster}', [ClusterController::class, 'update'])->name('clusters.update');
        Route::delete('/clusters/{cluster}', [ClusterController::class, 'destroy'])->name('clusters.destroy');

        Route::post('/unit-types', [UnitTypeController::class, 'store'])->name('unit-types.store');
        Route::match(['put', 'post'], '/unit-types/{unitType}', [UnitTypeController::class, 'update'])->name('unit-types.update');
        Route::delete('/unit-types/{unitType}', [UnitTypeController::class, 'destroy'])->name('unit-types.destroy');
    });

    // Unit & Kavling
    Route::get('/units', [HousingUnitController::class, 'index'])->name('units.index');
    Route::middleware('can:create-units')->group(function () {
        Route::post('/units', [HousingUnitController::class, 'store'])->name('units.store');
        Route::put('/units/{housingUnit}', [HousingUnitController::class, 'update'])->name('units.update');
        Route::patch('/units/{housingUnit}/status', [HousingUnitController::class, 'updateStatus'])->name('units.update-status');
        Route::delete('/units/{housingUnit}', [HousingUnitController::class, 'destroy'])->name('units.destroy');
    });

    // Interactive Siteplan Map
    Route::get('/siteplan', [SiteplanController::class, 'index'])->name('siteplan.index');
    Route::post('/siteplan/upload-svg', [SiteplanController::class, 'uploadSvg'])->name('siteplan.upload-svg');
});

// Penjualan & Leads CRM
Route::middleware(['auth', 'can:view-leads'])->group(function () {
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');

    Route::middleware('can:create-leads')->group(function () {
        Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
    });

    Route::middleware('can:edit-leads')->group(function () {
        Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
        Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.update-status');
    });

    Route::middleware('can:delete-leads')->group(function () {
        Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');
    });
});

// Transaksi Booking Fee & SPR
Route::middleware(['auth', 'can:view-bookings'])->group(function () {
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');

    Route::middleware('can:create-bookings')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
        Route::post('/bookings/{booking}/payments', [BookingController::class, 'addPayment'])->name('bookings.payments.store');
    });

    Route::middleware('can:approve-bookings')->group(function () {
        Route::post('/bookings/{booking}/approve', [BookingController::class, 'approve'])->name('bookings.approve');
        Route::patch('/bookings/{booking}/complete', [BookingController::class, 'completeTransaction'])->name('bookings.complete');
    });

    Route::middleware('can:cancel-bookings')->group(function () {
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    });

    Route::middleware('can:verify-payments')->group(function () {
        Route::patch('/bookings/payments/{payment}/verify', [BookingController::class, 'verifyPayment'])->name('bookings.payments.verify');
    });

    Route::middleware('can:manage-kpr')->group(function () {
        Route::post('/bookings/{booking}/kpr', [BookingController::class, 'updateKpr'])->name('bookings.kpr.update');
    });
});

require __DIR__.'/auth.php';
