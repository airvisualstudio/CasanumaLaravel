<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::with('roles')
            ->withCount(['leads', 'bookings'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar_url,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'emergency_contact_name' => $user->emergency_contact_name,
                    'emergency_contact_phone' => $user->emergency_contact_phone,
                    'employee_id' => $user->employee_id,
                    'position' => $user->position,
                    'join_date' => $user->join_date?->format('Y-m-d'),
                    'join_date_formatted' => $user->join_date?->format('d M Y') ?? '-',
                    'is_active' => (bool) $user->is_active,
                    'leads_count' => (int) $user->leads_count,
                    'bookings_count' => (int) $user->bookings_count,
                    'bank_name' => $user->bank_name,
                    'bank_account_number' => $user->bank_account_number,
                    'bank_account_holder' => $user->bank_account_holder,
                    'roles' => $user->roles->pluck('name'),
                    'created_at' => $user->created_at?->format('d M Y, H:i') ?? '-',
                ];
            });

        $roles = Role::pluck('name');

        // Active sales and managers for lead handover selection
        $activeSales = User::role(['sales_agent', 'sales_manager'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'availableRoles' => $roles,
            'activeSales' => $activeSales,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'employee_id' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:100'],
            'join_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
        ];

        $messages = [
            'avatar.image' => 'Berkas avatar harus berupa gambar.',
            'avatar.mimes' => 'Format avatar yang didukung: JPG, JPEG, PNG.',
            'avatar.max' => 'Ukuran avatar tidak boleh melebihi 2MB.',
        ];

        $validated = $request->validate($rules, $messages);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $validated['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : true;
        $validated['password'] = Hash::make($validated['password']);

        $role = $validated['role'];
        unset($validated['role']);

        $user = User::create($validated);
        $user->syncRoles([$role]);

        ActivityLog::record(
            'user_create',
            "Menambahkan pengguna baru: {$user->name} ({$role})",
            $user,
            ['email' => $user->email, 'role' => $role]
        );

        return back()->with('success', "Pengguna {$user->name} berhasil ditambahkan!");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'employee_id' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:100'],
            'join_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
        ];

        $messages = [
            'avatar.image' => 'Berkas avatar harus berupa gambar.',
            'avatar.mimes' => 'Format avatar yang didukung: JPG, JPEG, PNG.',
            'avatar.max' => 'Ukuran avatar tidak boleh melebihi 2MB.',
        ];

        $validated = $request->validate($rules, $messages);

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = null;
        } else {
            unset($validated['avatar']);
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $role = $validated['role'];
        unset($validated['role']);

        $user->update($validated);
        $user->syncRoles([$role]);

        ActivityLog::record(
            'user_update',
            "Memperbarui data pengguna: {$user->name}",
            $user,
            ['email' => $user->email, 'role' => $role]
        );

        return back()->with('success', "Data pengguna {$user->name} berhasil diperbarui!");
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'error' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif!',
            ]);
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        ActivityLog::record(
            'status_toggle',
            "Mengubah status akun {$user->name} menjadi {$statusText}",
            $user,
            ['is_active' => $user->is_active]
        );

        return back()->with('success', "Status akun {$user->name} berhasil {$statusText}.");
    }

    /**
     * Deactivate user and optionally handover their assigned leads to another sales agent in one click.
     */
    public function deactivateAndHandover(Request $request, User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'error' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif!',
            ]);
        }

        $validated = $request->validate([
            'target_sales_id' => ['nullable', 'exists:users,id'],
        ]);

        $targetSalesId = $validated['target_sales_id'] ?? null;
        $leads = $user->leads;
        $leadsCount = $leads->count();
        $targetSales = null;

        if ($targetSalesId) {
            $targetSales = User::findOrFail($targetSalesId);
            if (! $targetSales->is_active) {
                return back()->withErrors([
                    'target_sales_id' => 'Sales target pengalihan harus berstatus aktif.',
                ]);
            }
            if ($targetSales->id === $user->id) {
                return back()->withErrors([
                    'target_sales_id' => 'Sales target pengalihan tidak boleh sama dengan pengguna yang dinonaktifkan.',
                ]);
            }
        }

        DB::transaction(function () use ($user, $targetSales, $leads, $leadsCount) {
            if ($targetSales && $leadsCount > 0) {
                // Reassign all leads
                Lead::where('sales_id', $user->id)->update([
                    'sales_id' => $targetSales->id,
                ]);

                // Record timeline note for each lead
                foreach ($leads as $lead) {
                    $lead->interactions()->create([
                        'user_id' => auth()->id(),
                        'channel' => 'system',
                        'interaction_date' => now()->toDateString(),
                        'notes' => "🛡️ Handover Otomatis: Prospek dialihkan dari {$user->name} ke {$targetSales->name} karena status akun dinonaktifkan.",
                        'completed_at' => now(),
                    ]);
                }

                ActivityLog::record(
                    'lead_handover',
                    "Melakukan handover {$leadsCount} prospek konsumen dari {$user->name} ke {$targetSales->name} saat nonaktifkan akun",
                    $user,
                    [
                        'from_user_id' => $user->id,
                        'to_user_id' => $targetSales->id,
                        'leads_count' => $leadsCount,
                    ]
                );
            } elseif ($leadsCount > 0) {
                // Set to unassigned
                Lead::where('sales_id', $user->id)->update([
                    'sales_id' => null,
                ]);

                foreach ($leads as $lead) {
                    $lead->interactions()->create([
                        'user_id' => auth()->id(),
                        'channel' => 'system',
                        'notes' => "🛡️ Handover Otomatis: Prospek dilepas ke Unassigned Pool dari {$user->name} karena status akun dinonaktifkan.",
                        'completed_at' => now(),
                    ]);
                }

                ActivityLog::record(
                    'lead_handover',
                    "Melepas {$leadsCount} prospek konsumen dari {$user->name} ke Unassigned Pool saat nonaktifkan akun",
                    $user,
                    [
                        'from_user_id' => $user->id,
                        'to_user_id' => null,
                        'leads_count' => $leadsCount,
                    ]
                );
            }

            // Deactivate the user
            $user->update([
                'is_active' => false,
            ]);

            ActivityLog::record(
                'status_toggle',
                "Menonaktifkan status akun {$user->name}" . ($targetSales ? " dan mengoper {$leadsCount} prospek ke {$targetSales->name}" : ''),
                $user,
                ['is_active' => false]
            );
        });

        $msg = "Akun {$user->name} berhasil dinonaktifkan";
        if ($targetSales && $leadsCount > 0) {
            $msg .= " dan {$leadsCount} prospek konsumen berhasil dialihkan ke {$targetSales->name}.";
        } elseif ($leadsCount > 0) {
            $msg .= " dan {$leadsCount} prospek konsumen dipindahkan ke Unassigned Pool.";
        } else {
            $msg .= ".";
        }

        return back()->with('success', $msg);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'error' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!',
            ]);
        }

        // Prevent deletion if user has historical leads or bookings
        if ($user->leads()->count() > 0 || $user->bookings()->count() > 0) {
            return back()->withErrors([
                'error' => "Pengguna {$user->name} memiliki riwayat transaksi booking atau prospek konsumen yang terikat. Demi integritas data historis, akun ini tidak boleh dihapus. Silakan nonaktifkan status akun sebagai gantinya.",
            ]);
        }

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $user->delete();

        ActivityLog::record(
            'user_delete',
            "Menghapus akun pengguna: {$userName}",
            null,
            ['name' => $userName, 'email' => $userEmail]
        );

        return back()->with('success', "Pengguna {$userName} berhasil dihapus.");
    }

    /**
     * Force reset a user's password (Superadmin only).
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal terdiri dari 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLog::record(
            'password_reset',
            "Mereset password pengguna: {$user->name}",
            $user
        );

        return back()->with('success', "Password akun {$user->name} berhasil diperbarui!");
    }
}
