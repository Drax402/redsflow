<?php

use App\Http\Controllers\Admin\StaffApprovalController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BloodBagController;
use App\Http\Controllers\BloodTransferController;
use App\Http\Controllers\StorageUnitController;
use App\Http\Controllers\DonationRecordController;
use App\Http\Controllers\DonorController;
use App\Http\Controllers\EditRequestController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SecureImageController;
use App\Http\Controllers\UserDirectoryController;
use Illuminate\Support\Facades\Route;

Route::middleware([\App\Http\Middleware\SecurityHeaders::class])->group(function () {

    Route::get('/', [AuthController::class, 'showEntry'])->name('entry');

    Route::get('/csrf-token', fn () => response()->json(['csrf_token' => csrf_token()]))->name('csrf-token');

    Route::get('/email-available', [AuthController::class, 'emailAvailable'])->middleware('throttle:30,1')->name('email-available');
    Route::get('/username-available', [AuthController::class, 'usernameAvailable'])->middleware('throttle:30,1')->name('username-available');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOtp'])->name('forgot-password.send-otp');
    Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyOtp'])->name('forgot-password.verify-otp');
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword'])->name('forgot-password.reset');

    Route::middleware(['auth', \App\Http\Middleware\EnsureActiveAccount::class, 'throttle:120,1'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/change-password/send-otp', [AuthController::class, 'sendChangePasswordOtp'])->middleware('throttle:15,1')->name('change-password.send-otp');
        Route::post('/change-password/verify-otp', [AuthController::class, 'verifyChangePasswordOtp'])->middleware('throttle:20,1')->name('change-password.verify-otp');
        Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
        Route::put('/api/profile', [ProfileController::class, 'update'])->name('api.profile.update');
        Route::get('/secure-image/{userId}/{field}', [SecureImageController::class, 'show'])->name('secure-image');

        Route::get('/api/users', [UserDirectoryController::class, 'index'])->name('api.users');

        Route::get('/api/donors', [DonorController::class, 'index'])->name('api.donors.index');
        Route::post('/api/donors', [DonorController::class, 'store'])->name('api.donors.store');
        Route::put('/api/donors/{donor}', [DonorController::class, 'update'])->name('api.donors.update');
        Route::delete('/api/donors', [DonorController::class, 'destroyBulk'])->name('api.donors.destroy-bulk');

        Route::get('/api/donation-records', [DonationRecordController::class, 'index'])->name('api.records.index');
        Route::post('/api/donation-records', [DonationRecordController::class, 'upsert'])->name('api.records.upsert');
        Route::delete('/api/donation-records', [DonationRecordController::class, 'destroyBulk'])->name('api.records.destroy-bulk');

        Route::get('/api/edit-requests', [EditRequestController::class, 'index'])->name('api.edit-requests.index');
        Route::post('/api/edit-requests', [EditRequestController::class, 'store'])->name('api.edit-requests.store');
        Route::delete('/api/edit-requests-status/{status}', [EditRequestController::class, 'destroyByStatus'])->name('api.edit-requests.destroy-status');
        Route::delete('/api/edit-requests/{editRequest}', [EditRequestController::class, 'destroy'])->name('api.edit-requests.destroy');

        Route::get('/api/notifications', [NotificationController::class, 'index'])->name('api.notifications.index');
        Route::patch('/api/notifications/{notifId}/read', [NotificationController::class, 'setRead'])->name('api.notifications.read');
        Route::delete('/api/notifications/{notifId}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
        Route::delete('/api/notifications', [NotificationController::class, 'clear'])->name('api.notifications.clear');
    });

    Route::middleware(['auth', \App\Http\Middleware\EnsureAdmin::class, 'throttle:120,1'])->group(function () {
        Route::delete('/api/users/bulk', [UserDirectoryController::class, 'destroyBulk'])->name('api.users.destroy-bulk');
        Route::delete('/api/users/{uuid}', [UserDirectoryController::class, 'destroy'])->name('api.users.destroy');

        Route::get('/api/audit-log', [AuditLogController::class, 'index'])->name('api.audit-log.index');
        Route::delete('/api/audit-log/bulk', [AuditLogController::class, 'destroyBulk'])->name('api.audit-log.destroy-bulk');
        Route::delete('/api/audit-log', [AuditLogController::class, 'clear'])->name('api.audit-log.clear');
    });

    Route::middleware(['auth', \App\Http\Middleware\EnsureInventoryAccess::class])->prefix('admin')->group(function () {
        Route::get('/blood-bags', [BloodBagController::class, 'index'])->name('admin.blood-bags.index');
        Route::post('/blood-bags', [BloodBagController::class, 'store'])->name('admin.blood-bags.store');
        Route::get('/storage-units', [StorageUnitController::class, 'index'])->name('admin.storage-units.index');
        Route::post('/storage-units', [StorageUnitController::class, 'store'])->name('admin.storage-units.store');
        Route::patch('/storage-units/{unit}', [StorageUnitController::class, 'update'])->name('admin.storage-units.update');
        Route::delete('/storage-units/{unit}', [StorageUnitController::class, 'destroy'])->name('admin.storage-units.destroy');
        Route::delete('/blood-bags', [BloodBagController::class, 'destroyMany'])->name('admin.blood-bags.destroy-many');
        Route::get('/blood-transfers', [BloodTransferController::class, 'index'])->name('admin.blood-transfers.index');
        Route::post('/blood-transfers', [BloodTransferController::class, 'store'])->name('admin.blood-transfers.store');
        Route::delete('/blood-transfers', [BloodTransferController::class, 'destroyMany'])->name('admin.blood-transfers.destroy-many');
        Route::patch('/blood-transfers/{transfer}', [BloodTransferController::class, 'update'])->name('admin.blood-transfers.update');
        Route::delete('/edit-requests-bulk', [EditRequestController::class, 'destroyMany'])->name('admin.edit-requests.destroy-many');
        Route::post('/blood-bags/dispose-expired', [BloodBagController::class, 'disposeExpired'])->name('admin.blood-bags.dispose-expired');
        Route::patch('/blood-bags/{bag}/{as}', [BloodBagController::class, 'close'])->where('as', 'used|disposed')->name('admin.blood-bags.close');
        Route::patch('/edit-requests/{editRequest}/approve', [EditRequestController::class, 'approve'])->name('admin.edit-requests.approve');
        Route::delete('/edit-requests-status/{status}', [EditRequestController::class, 'destroyByStatus'])->name('admin.edit-requests.destroy-status');
        Route::delete('/edit-requests/{editRequest}', [EditRequestController::class, 'destroy'])->name('admin.edit-requests.destroy');
        Route::patch('/edit-requests/{editRequest}/reject', [EditRequestController::class, 'reject'])->name('admin.edit-requests.reject');
        Route::patch('/edit-requests/{editRequest}/change-info', [EditRequestController::class, 'changeInfo'])->name('admin.edit-requests.change-info');
    });

    Route::middleware(['auth', \App\Http\Middleware\EnsureAdmin::class])->prefix('admin')->group(function () {
        Route::patch('/staff/{uuid}/disable', [StaffApprovalController::class, 'disable'])->name('admin.staff.disable');
        Route::patch('/staff/{uuid}/enable', [StaffApprovalController::class, 'enable'])->name('admin.staff.enable');
        Route::patch('/staff/{uuid}/approve', [StaffApprovalController::class, 'approve'])->name('admin.staff.approve');
        Route::delete('/staff/{uuid}/reject', [StaffApprovalController::class, 'reject'])->name('admin.staff.reject');
        Route::post('/export/send-otp', [ExportController::class, 'sendOtp'])->middleware('throttle:15,1')->name('admin.export.send-otp');
        Route::post('/export/verify-otp', [ExportController::class, 'verifyOtp'])->middleware('throttle:20,1')->name('admin.export.verify-otp');
        Route::post('/export/authorize', [ExportController::class, 'authorizeExport'])->name('admin.export.authorize');
    });

});
