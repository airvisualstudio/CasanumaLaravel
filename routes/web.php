<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\GeneralSettingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
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
    Route::get('/properties', [\App\Http\Controllers\PropertyMasterController::class, 'index'])->name('properties.index');

    Route::middleware('can:create-units')->group(function () {
        Route::post('/developers', [\App\Http\Controllers\DeveloperController::class, 'store'])->name('developers.store');
        Route::match(['put', 'post'], '/developers/{developer}', [\App\Http\Controllers\DeveloperController::class, 'update'])->name('developers.update');
        Route::delete('/developers/{developer}', [\App\Http\Controllers\DeveloperController::class, 'destroy'])->name('developers.destroy');

        Route::post('/housing-projects', [\App\Http\Controllers\HousingProjectController::class, 'store'])->name('housing-projects.store');
        Route::match(['put', 'post'], '/housing-projects/{housingProject}', [\App\Http\Controllers\HousingProjectController::class, 'update'])->name('housing-projects.update');
        Route::delete('/housing-projects/{housingProject}', [\App\Http\Controllers\HousingProjectController::class, 'destroy'])->name('housing-projects.destroy');
    });

    // Cluster & Site Plan
    Route::get('/clusters', [\App\Http\Controllers\ClusterController::class, 'index'])->name('clusters.index');
    Route::middleware('can:create-units')->group(function () {
        Route::post('/clusters', [\App\Http\Controllers\ClusterController::class, 'store'])->name('clusters.store');
        Route::put('/clusters/{cluster}', [\App\Http\Controllers\ClusterController::class, 'update'])->name('clusters.update');
        Route::delete('/clusters/{cluster}', [\App\Http\Controllers\ClusterController::class, 'destroy'])->name('clusters.destroy');

        Route::post('/unit-types', [\App\Http\Controllers\UnitTypeController::class, 'store'])->name('unit-types.store');
        Route::match(['put', 'post'], '/unit-types/{unitType}', [\App\Http\Controllers\UnitTypeController::class, 'update'])->name('unit-types.update');
        Route::delete('/unit-types/{unitType}', [\App\Http\Controllers\UnitTypeController::class, 'destroy'])->name('unit-types.destroy');
    });

    // Unit & Kavling
    Route::get('/units', [\App\Http\Controllers\HousingUnitController::class, 'index'])->name('units.index');
    Route::middleware('can:create-units')->group(function () {
        Route::post('/units', [\App\Http\Controllers\HousingUnitController::class, 'store'])->name('units.store');
        Route::put('/units/{housingUnit}', [\App\Http\Controllers\HousingUnitController::class, 'update'])->name('units.update');
        Route::patch('/units/{housingUnit}/status', [\App\Http\Controllers\HousingUnitController::class, 'updateStatus'])->name('units.update-status');
        Route::delete('/units/{housingUnit}', [\App\Http\Controllers\HousingUnitController::class, 'destroy'])->name('units.destroy');
    });
});

require __DIR__.'/auth.php';
