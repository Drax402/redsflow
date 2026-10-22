SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS `redflow_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `redflow_db`;

DROP TABLE IF EXISTS `blood_transfers`, `blood_bags`, `storage_units`, `edit_requests`, `export_guards`, `secure_files`, `password_reset_otps`, `user_logs`, `audit_log`, `app_notifications`, `staff_profiles`, `monitoring_transactions`, `monitoring_records`, `donors`, `users`, `sessions`, `cache`, `cache_locks`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `username` VARCHAR(40) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `contact` TEXT DEFAULT NULL,
  `brgy` TEXT DEFAULT NULL,
  `gender` TEXT DEFAULT NULL,
  `ext_name` TEXT DEFAULT NULL,
  `dob` TEXT DEFAULT NULL,
  `role` ENUM('Admin','Staff') NOT NULL DEFAULT 'Staff',
  `status` ENUM('Pending','Approved') NOT NULL DEFAULT 'Pending',
  `id_front_path` VARCHAR(255) DEFAULT NULL,
  `id_back_path` VARCHAR(255) DEFAULT NULL,
  `face_doc_path` VARCHAR(255) DEFAULT NULL,
  `action_taken` VARCHAR(255) NOT NULL DEFAULT 'Registered',
  `approved_by` BIGINT UNSIGNED DEFAULT NULL,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `is_disabled` TINYINT(1) NOT NULL DEFAULT 0,
  `disabled_at` TIMESTAMP NULL DEFAULT NULL,
  `disabled_by` BIGINT UNSIGNED DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `failed_login_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_uuid_unique` (`uuid`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_approved_by_foreign` (`approved_by`),
  CONSTRAINT `users_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `staff_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `avatar_path` VARCHAR(255) DEFAULT NULL,
  `extra` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_profiles_user_id_unique` (`user_id`),
  CONSTRAINT `staff_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `donors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `donor_uid` VARCHAR(255) NOT NULL,
  `name` TEXT NOT NULL,
  `blood_type` TEXT DEFAULT NULL,
  `contact` TEXT DEFAULT NULL,
  `brgy` TEXT DEFAULT NULL,
  `gender` TEXT DEFAULT NULL,
  `dob` TEXT DEFAULT NULL,
  `extra` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `donors_donor_uid_unique` (`donor_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `monitoring_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `record_uid` VARCHAR(255) NOT NULL,
  `donor_id` BIGINT UNSIGNED DEFAULT NULL,
  `donation_date` DATE NOT NULL,
  `blood_type` TEXT DEFAULT NULL,
  `times_donated` INT UNSIGNED NOT NULL DEFAULT 1,
  `extra` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `monitoring_records_record_uid_unique` (`record_uid`),
  KEY `monitoring_records_donor_id_foreign` (`donor_id`),
  CONSTRAINT `monitoring_records_donor_id_foreign` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `monitoring_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_uid` VARCHAR(255) NOT NULL,
  `donor_id` BIGINT UNSIGNED NOT NULL,
  `monitoring_record_id` BIGINT UNSIGNED DEFAULT NULL,
  `donation_date` DATE NOT NULL,
  `blood_type` TEXT DEFAULT NULL,
  `extra` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `monitoring_transactions_transaction_uid_unique` (`transaction_uid`),
  KEY `monitoring_transactions_donor_id_foreign` (`donor_id`),
  KEY `monitoring_transactions_monitoring_record_id_foreign` (`monitoring_record_id`),
  CONSTRAINT `monitoring_transactions_donor_id_foreign` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `monitoring_transactions_monitoring_record_id_foreign` FOREIGN KEY (`monitoring_record_id`) REFERENCES `monitoring_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `storage_units` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(60) NOT NULL,
  `temperature` VARCHAR(40) NOT NULL,
  `kind` VARCHAR(12) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storage_units_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `storage_units` (`name`,`temperature`,`kind`,`created_at`,`updated_at`) VALUES
('Refrigerator 1','2-6 C','fridge',NOW(),NOW()),
('Refrigerator 2','2-6 C','fridge',NOW(),NOW()),
('Platelet Agitator 1','20-24 C','agitator',NOW(),NOW()),
('Freezer 1','-18 C or colder','freezer',NOW(),NOW());

CREATE TABLE `blood_bags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bag_uid` VARCHAR(40) NOT NULL,
  `bag_code` VARCHAR(40) NOT NULL,
  `blood_center` VARCHAR(120) DEFAULT NULL,
  `donor_id` BIGINT UNSIGNED DEFAULT NULL,
  `donor_name` TEXT DEFAULT NULL,
  `blood_type` TEXT DEFAULT NULL,
  `component` VARCHAR(20) NOT NULL,
  `units` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `collected_on` DATE NOT NULL,
  `expires_on` DATE NOT NULL,
  `result` VARCHAR(20) NOT NULL DEFAULT 'Usable',
  `storage_location` VARCHAR(60) DEFAULT NULL,
  `storage_unit_id` BIGINT UNSIGNED DEFAULT NULL,
  `shelf` VARCHAR(40) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'In Stock',
  `alerted_level` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `closed_at` TIMESTAMP NULL DEFAULT NULL,
  `recorded_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blood_bags_bag_uid_unique` (`bag_uid`),
  UNIQUE KEY `blood_bags_bag_code_unique` (`bag_code`),
  KEY `blood_bags_status_expires_on_index` (`status`,`expires_on`),
  KEY `blood_bags_collected_on_index` (`collected_on`),
  KEY `blood_bags_unit_status_index` (`storage_unit_id`,`status`),
  CONSTRAINT `blood_bags_donor_id_foreign` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blood_bags_storage_unit_id_foreign` FOREIGN KEY (`storage_unit_id`) REFERENCES `storage_units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blood_bags_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blood_transfers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kind` VARCHAR(12) NOT NULL,
  `blood_bag_id` BIGINT UNSIGNED DEFAULT NULL,
  `bag_code` VARCHAR(40) DEFAULT NULL,
  `component` VARCHAR(30) DEFAULT NULL,
  `blood_type` TEXT DEFAULT NULL,
  `destination` VARCHAR(150) DEFAULT NULL,
  `patient_name` TEXT DEFAULT NULL,
  `reason` VARCHAR(160) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `transferred_on` DATE NOT NULL,
  `recorded_by` BIGINT UNSIGNED DEFAULT NULL,
  `recorded_by_name` VARCHAR(120) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `blood_transfers_kind_transferred_on_index` (`kind`,`transferred_on`),
  KEY `blood_transfers_blood_bag_id_index` (`blood_bag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `edit_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `requested_by` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `donor_id` BIGINT UNSIGNED DEFAULT NULL,
  `donor_name` TEXT DEFAULT NULL,
  `payload` LONGTEXT DEFAULT NULL,
  `original` LONGTEXT DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
  `reviewed_by` BIGINT UNSIGNED DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `hidden_by_requester` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `edit_requests_status_type_index` (`status`,`type`),
  CONSTRAINT `edit_requests_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `edit_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `app_notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `category` VARCHAR(30) NOT NULL DEFAULT 'other',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `app_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `user_name` VARCHAR(255) DEFAULT NULL,
  `user_role` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(255) NOT NULL,
  `action_label` VARCHAR(255) DEFAULT NULL,
  `donor_id` BIGINT UNSIGNED DEFAULT NULL,
  `donor_name` TEXT DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `logged_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_log_user_id_foreign` (`user_id`),
  CONSTRAINT `audit_log_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `event` VARCHAR(255) NOT NULL,
  `occurred_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `user_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_otps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `consumed` TINYINT(1) NOT NULL DEFAULT 0,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `password_reset_otps_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `export_guards` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `failed_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` TIMESTAMP NULL DEFAULT NULL,
  `exports` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `export_guards_user_id_unique` (`user_id`),
  CONSTRAINT `export_guards_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `secure_files` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `secure_files_path_unique` (`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` VARCHAR(255) NOT NULL,
  `batch` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

TRUNCATE TABLE `migrations`;
INSERT INTO `migrations` (`migration`,`batch`) VALUES
('2024_01_01_000000_create_sessions_table',1),
('2024_01_01_000001_create_users_table',1),
('2024_01_01_000002_create_donors_table',1),
('2024_01_01_000003_create_monitoring_records_table',1),
('2024_01_01_000004_create_monitoring_transactions_table',1),
('2024_01_01_000005_create_staff_profiles_table',1),
('2024_01_01_000006_create_app_notifications_table',1),
('2024_01_01_000007_create_audit_log_table',1),
('2024_01_01_000008_create_user_logs_table',1),
('2024_01_01_000009_create_password_reset_otps_table',1),
('2024_01_02_000000_add_performance_indexes',1),
('2024_01_02_000001_add_approved_by_to_users_table',1),
('2024_01_02_000002_rename_edit_audit_log_action_to_update',1),
('2024_01_02_000003_clean_up_corrupted_donor_brgy',1),
('2024_01_02_000004_create_secure_files_table',1),
('2024_01_03_000001_widen_columns_for_encryption',1),
('2024_01_03_000002_encrypt_existing_data',1),
('2024_01_03_000003_backfill_profiles_and_transactions',1),
('2024_01_04_000001_create_export_guards_table',1),
('2024_01_04_000002_add_attempts_to_password_reset_otps',1),
('2024_01_05_000001_add_username_disable_edit_requests_notif_category',1),
('2024_01_06_000001_add_hidden_by_requester_to_edit_requests',1),
('2024_01_07_000001_encrypt_user_personal_data',1),
('2024_01_08_000001_create_blood_bags_table',1),
('2024_01_09_000001_create_storage_units_table',1),
('2024_01_10_000001_clean_up_donors_and_add_bag_index',1),
('2024_01_11_000001_allow_blood_bank_medtech_role',1),
('2024_01_12_000001_create_blood_transfers_table',1),
('2024_01_13_000001_remove_blood_bank_medtech_role',1),
('2024_01_14_000001_split_released_blood_bag_status',1),
('2024_01_15_000001_ensure_cache_tables',1);

SET FOREIGN_KEY_CHECKS=1;
