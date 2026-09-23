-- ============================================================
-- ARISE HEALTHCARE SOLUTIONS — HOSTINGER MYSQL SCHEMA
-- Target: u791891216_arisehealth (MySQL 8.0+)
-- Generated from Phase 1 audit findings
-- Run this file ONCE against the Hostinger database.
-- All statements are idempotent (IF NOT EXISTS).
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================
-- USERS  (replaces Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`            CHAR(36)     NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name`     VARCHAR(120)         DEFAULT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SESSIONS  (JWT-based, server-validated)
-- ============================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id`          CHAR(36)     NOT NULL,
  `user_id`     CHAR(36)     NOT NULL,
  `token_hash`  VARCHAR(255) NOT NULL,
  `expires_at`  DATETIME(6)  NOT NULL,
  `user_agent`  VARCHAR(500)         DEFAULT NULL,
  `ip_address`  VARCHAR(50)          DEFAULT NULL,
  `created_at`  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sessions_token` (`token_hash`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id`         CHAR(36)     NOT NULL,
  `user_id`    CHAR(36)     NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(6)  NOT NULL,
  `used`       TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prt_token` (`token_hash`),
  KEY `idx_prt_user` (`user_id`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROFILES  (user display info)
-- ============================================================
CREATE TABLE IF NOT EXISTS `profiles` (
  `id`         CHAR(36)     NOT NULL,
  `email`      VARCHAR(255)         DEFAULT NULL,
  `full_name`  VARCHAR(120)         DEFAULT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USER ROLES  (admin | staff | user)
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id`         CHAR(36)                        NOT NULL,
  `user_id`    CHAR(36)                        NOT NULL,
  `role`       ENUM('admin','staff','user')    NOT NULL,
  `created_at` DATETIME(6)                     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- STAFF PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS `staff_permissions` (
  `user_id`    CHAR(36)     NOT NULL,
  `permission` VARCHAR(100) NOT NULL,
  `granted_by` CHAR(36)             DEFAULT NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_id`, `permission`),
  CONSTRAINT `fk_sp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_grantor` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADMIN LOGIN AUDIT
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_login_audit` (
  `id`         CHAR(36)                     NOT NULL,
  `user_id`    CHAR(36)                             DEFAULT NULL,
  `email`      VARCHAR(255)                         DEFAULT NULL,
  `role`       ENUM('admin','staff','user')         DEFAULT NULL,
  `event_type` VARCHAR(50)                  NOT NULL,
  `success`    TINYINT(1)                   NOT NULL,
  `user_agent` VARCHAR(500)                         DEFAULT NULL,
  `ip_address` VARCHAR(50)                          DEFAULT NULL,
  `created_at` DATETIME(6)                  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_ala_user` (`user_id`),
  KEY `idx_ala_created` (`created_at`),
  CONSTRAINT `fk_ala_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REPAIR REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `repair_requests` (
  `id`                    CHAR(36)     NOT NULL,
  `request_code`          VARCHAR(30)  NOT NULL,
  `full_name`             VARCHAR(120) NOT NULL,
  `organisation`          VARCHAR(200)         DEFAULT NULL,
  `mobile`                VARCHAR(20)  NOT NULL,
  `whatsapp`              VARCHAR(20)          DEFAULT NULL,
  `email`                 VARCHAR(200) NOT NULL,
  `city`                  VARCHAR(100)         DEFAULT NULL,
  `state`                 VARCHAR(100)         DEFAULT NULL,
  `equipment_category`    VARCHAR(100)         DEFAULT NULL,
  `equipment_name`        VARCHAR(200) NOT NULL,
  `brand`                 VARCHAR(100)         DEFAULT NULL,
  `model_no`              VARCHAR(100)         DEFAULT NULL,
  `serial_no`             VARCHAR(100)         DEFAULT NULL,
  `problem_description`   TEXT         NOT NULL,
  `urgency`               VARCHAR(20)  NOT NULL DEFAULT 'normal',
  `preferred_contact`     VARCHAR(20)  NOT NULL DEFAULT 'phone',
  `pickup_required`       TINYINT(1)   NOT NULL DEFAULT 0,
  `consent`               TINYINT(1)   NOT NULL DEFAULT 0,
  `request_source`        VARCHAR(50)  NOT NULL DEFAULT 'Website',
  `status`                ENUM(
    'request_received','awaiting_equipment','equipment_received','under_inspection',
    'quotation_sent','approval_pending','repair_in_progress','quality_testing',
    'ready_for_dispatch','dispatched','completed','on_hold','cancelled'
  ) NOT NULL DEFAULT 'request_received',
  `current_location`      VARCHAR(20)  NOT NULL DEFAULT 'Office',
  `admin_notes`           TEXT                 DEFAULT NULL,
  `customer_visible_note` TEXT                 DEFAULT NULL,
  `estimated_cost`        DECIMAL(10,2)        DEFAULT NULL,
  `assigned_to`           VARCHAR(120)         DEFAULT NULL,
  `inspection_notes`      TEXT                 DEFAULT NULL,
  `repair_notes`          TEXT                 DEFAULT NULL,
  `quality_testing_notes` TEXT                 DEFAULT NULL,
  `dispatch_notes`        TEXT                 DEFAULT NULL,
  `created_at`            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rr_code` (`request_code`),
  KEY `idx_rr_status` (`status`),
  KEY `idx_rr_mobile` (`mobile`),
  KEY `idx_rr_email` (`email`),
  KEY `idx_rr_created` (`created_at`),
  CONSTRAINT `chk_rr_location` CHECK (`current_location` IN ('Office','LAB 1','LAB 2'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REPAIR REQUEST PUBLIC UPDATES (PII-stripped mirror for staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS `repair_request_public_updates` (
  `id`                    CHAR(36)     NOT NULL,
  `request_code`          VARCHAR(30)  NOT NULL,
  `full_name`             VARCHAR(120) NOT NULL,
  `equipment_category`    VARCHAR(100)         DEFAULT NULL,
  `equipment_name`        VARCHAR(200) NOT NULL,
  `brand`                 VARCHAR(100)         DEFAULT NULL,
  `model_no`              VARCHAR(100)         DEFAULT NULL,
  `serial_no`             VARCHAR(100)         DEFAULT NULL,
  `problem_description`   TEXT         NOT NULL,
  `status`                ENUM(
    'request_received','awaiting_equipment','equipment_received','under_inspection',
    'quotation_sent','approval_pending','repair_in_progress','quality_testing',
    'ready_for_dispatch','dispatched','completed','on_hold','cancelled'
  ) NOT NULL DEFAULT 'request_received',
  `current_location`      VARCHAR(20)  NOT NULL DEFAULT 'Office',
  `customer_visible_note` TEXT                 DEFAULT NULL,
  `assigned_to`           VARCHAR(120)         DEFAULT NULL,
  `inspection_notes`      TEXT                 DEFAULT NULL,
  `repair_notes`          TEXT                 DEFAULT NULL,
  `quality_testing_notes` TEXT                 DEFAULT NULL,
  `dispatch_notes`        TEXT                 DEFAULT NULL,
  `created_at`            DATETIME(6)  NOT NULL,
  `updated_at`            DATETIME(6)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rrpu_code` (`request_code`),
  KEY `idx_rrpu_status` (`status`),
  CONSTRAINT `fk_rrpu_rr` FOREIGN KEY (`id`) REFERENCES `repair_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REPAIR STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS `repair_status_history` (
  `id`           CHAR(36)     NOT NULL,
  `request_id`   CHAR(36)     NOT NULL,
  `status`       VARCHAR(50)  NOT NULL,
  `old_status`   VARCHAR(50)          DEFAULT NULL,
  `new_status`   VARCHAR(50)          DEFAULT NULL,
  `old_location` VARCHAR(20)          DEFAULT NULL,
  `new_location` VARCHAR(20)          DEFAULT NULL,
  `note`         TEXT                 DEFAULT NULL,
  `created_by`   CHAR(36)             DEFAULT NULL,
  `created_at`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_rsh_request` (`request_id`),
  CONSTRAINT `fk_rsh_request` FOREIGN KEY (`request_id`) REFERENCES `repair_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rsh_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REPAIR REQUEST ACTIVITY
-- ============================================================
CREATE TABLE IF NOT EXISTS `repair_request_activity` (
  `id`           CHAR(36)     NOT NULL,
  `request_id`   CHAR(36)     NOT NULL,
  `actor_id`     CHAR(36)             DEFAULT NULL,
  `action`       VARCHAR(100) NOT NULL,
  `old_status`   VARCHAR(50)          DEFAULT NULL,
  `new_status`   VARCHAR(50)          DEFAULT NULL,
  `old_location` VARCHAR(20)          DEFAULT NULL,
  `new_location` VARCHAR(20)          DEFAULT NULL,
  `note`         TEXT                 DEFAULT NULL,
  `created_at`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_rra_request` (`request_id`),
  CONSTRAINT `fk_rra_request` FOREIGN KEY (`request_id`) REFERENCES `repair_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rra_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id`           CHAR(36)     NOT NULL,
  `name`         VARCHAR(120) NOT NULL,
  `email`        VARCHAR(255) NOT NULL,
  `mobile`       VARCHAR(20)          DEFAULT NULL,
  `organisation` VARCHAR(200)         DEFAULT NULL,
  `subject`      VARCHAR(300)         DEFAULT NULL,
  `message`      TEXT         NOT NULL,
  `enquiry_type` VARCHAR(50)  NOT NULL DEFAULT 'general',
  `status`       VARCHAR(50)  NOT NULL DEFAULT 'new',
  `is_read`      TINYINT(1)   NOT NULL DEFAULT 0,
  `admin_note`   TEXT                 DEFAULT NULL,
  `created_at`   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_enq_read` (`is_read`),
  KEY `idx_enq_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`            CHAR(36)     NOT NULL,
  `type`          VARCHAR(50)  NOT NULL DEFAULT 'system',
  `title`         VARCHAR(255) NOT NULL,
  `message`       TEXT         NOT NULL,
  `related_table` VARCHAR(100)         DEFAULT NULL,
  `related_id`    VARCHAR(36)          DEFAULT NULL,
  `is_read`       TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_notif_read` (`is_read`),
  KEY `idx_notif_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS `services` (
  `slug`                 VARCHAR(200) NOT NULL,
  `name`                 VARCHAR(200) NOT NULL,
  `category`             VARCHAR(100) NOT NULL DEFAULT 'General',
  `short_description`    TEXT         NOT NULL,
  `detailed_description` LONGTEXT     NOT NULL,
  `common_problems`      JSON                  DEFAULT NULL,
  `carousel_images`      JSON                  DEFAULT NULL,
  `primary_image_id`     VARCHAR(200)          DEFAULT NULL,
  `is_published`         TINYINT(1)   NOT NULL DEFAULT 1,
  `is_featured`          TINYINT(1)   NOT NULL DEFAULT 0,
  `sort_order`           INT          NOT NULL DEFAULT 0,
  `created_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`slug`),
  KEY `idx_svc_published` (`is_published`),
  KEY `idx_svc_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`            CHAR(36)     NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `organisation`  VARCHAR(200)         DEFAULT NULL,
  `city`          VARCHAR(100)         DEFAULT NULL,
  `rating`        TINYINT      NOT NULL DEFAULT 5,
  `feedback`      TEXT         NOT NULL,
  `is_sample`     TINYINT(1)   NOT NULL DEFAULT 0,
  `is_approved`   TINYINT(1)   NOT NULL DEFAULT 0,
  `is_featured`   TINYINT(1)   NOT NULL DEFAULT 0,
  `sort_order`    INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_testi_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BLOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS `blogs` (
  `id`                 CHAR(36)                                      NOT NULL,
  `title`              VARCHAR(255)                                  NOT NULL,
  `slug`               VARCHAR(255)                                  NOT NULL,
  `excerpt`            TEXT                                          NOT NULL,
  `content`            LONGTEXT                                      NOT NULL,
  `thumbnail_url`      TEXT                                                   DEFAULT NULL,
  `thumbnail_alt`      VARCHAR(300)                                           DEFAULT NULL,
  `category`           VARCHAR(100)                                  NOT NULL DEFAULT 'Repair Insights',
  `difficulty`         ENUM('Beginner','Intermediate','Advanced','Expert')    DEFAULT 'Beginner',
  `reading_time`       INT                                           NOT NULL DEFAULT 4,
  `published_at`       DATETIME(6)                                            DEFAULT NULL,
  `status`             ENUM('draft','published')                    NOT NULL DEFAULT 'draft',
  `author`             VARCHAR(120)                                  NOT NULL DEFAULT 'Arise Healthcare Solutions',
  `primary_keyword`    VARCHAR(200)                                           DEFAULT NULL,
  `secondary_keywords` JSON                                                   DEFAULT NULL,
  `tags`               JSON                                                   DEFAULT NULL,
  `equipment`          JSON                                                   DEFAULT NULL,
  `takeaways`          JSON                                                   DEFAULT NULL,
  `meta_title`         VARCHAR(255)                                           DEFAULT NULL,
  `meta_description`   TEXT                                                   DEFAULT NULL,
  `canonical_url`      VARCHAR(500)                                           DEFAULT NULL,
  `og_image_url`       TEXT                                                   DEFAULT NULL,
  `created_by`         CHAR(36)                                               DEFAULT NULL,
  `updated_by`         CHAR(36)                                               DEFAULT NULL,
  `created_at`         DATETIME(6)                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`         DATETIME(6)                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_blogs_slug` (`slug`),
  KEY `idx_blogs_status_date` (`status`, `published_at`),
  KEY `idx_blogs_category` (`category`),
  KEY `idx_blogs_updated` (`updated_at`),
  CONSTRAINT `fk_blogs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_blogs_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS `tracking` (
  `id`              CHAR(36)     NOT NULL,
  `tracking_id`     VARCHAR(100)         DEFAULT NULL,
  `order_id`        CHAR(36)             DEFAULT NULL,
  `customer_name`   VARCHAR(120)         DEFAULT NULL,
  `customer_email`  VARCHAR(255)         DEFAULT NULL,
  `customer_mobile` VARCHAR(20)          DEFAULT NULL,
  `equipment_name`  VARCHAR(200)         DEFAULT NULL,
  `status`          VARCHAR(50)  NOT NULL DEFAULT 'pending',
  `timeline`        JSON                  DEFAULT NULL,
  `created_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tracking_id` (`tracking_id`),
  KEY `idx_trk_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               CHAR(36)      NOT NULL,
  `order_number`     VARCHAR(50)           DEFAULT NULL,
  `customer_name`    VARCHAR(120)          DEFAULT NULL,
  `customer_email`   VARCHAR(255)          DEFAULT NULL,
  `customer_mobile`  VARCHAR(20)           DEFAULT NULL,
  `shipping_address` TEXT                  DEFAULT NULL,
  `service_name`     VARCHAR(200)          DEFAULT NULL,
  `total_amount`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status`   VARCHAR(50)   NOT NULL DEFAULT 'pending',
  `payment_method`   VARCHAR(50)           DEFAULT NULL,
  `transaction_id`   VARCHAR(100)          DEFAULT NULL,
  `status`           VARCHAR(50)   NOT NULL DEFAULT 'pending',
  `tracking_id`      VARCHAR(100)          DEFAULT NULL,
  `fulfillment_note` TEXT                  DEFAULT NULL,
  `created_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  KEY `idx_ord_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`         CHAR(36)      NOT NULL,
  `order_id`   CHAR(36)      NOT NULL,
  `name`       VARCHAR(200)          DEFAULT NULL,
  `image_url`  TEXT                  DEFAULT NULL,
  `quantity`   INT           NOT NULL DEFAULT 1,
  `price`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_oi_order` (`order_id`),
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDER EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_events` (
  `id`         CHAR(36)     NOT NULL,
  `order_id`   CHAR(36)     NOT NULL,
  `title`      VARCHAR(255)         DEFAULT NULL,
  `message`    TEXT                 DEFAULT NULL,
  `status`     VARCHAR(50)          DEFAULT NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_oe_order` (`order_id`),
  CONSTRAINT `fk_oe_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- WEBSITE IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS `website_images` (
  `id`         CHAR(36)     NOT NULL,
  `bucket`     VARCHAR(50)  NOT NULL DEFAULT 'admin-images',
  `path`       VARCHAR(500) NOT NULL,
  `url`        TEXT                 DEFAULT NULL,
  `alt_text`   VARCHAR(300)         DEFAULT NULL,
  `category`   VARCHAR(100)         DEFAULT NULL,
  `is_primary` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wi_bucket_path` (`bucket`, `path`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OFFICE AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS `office_availability` (
  `id`           CHAR(36)                                    NOT NULL,
  `status`       ENUM('open','closed','temporarily_closed') NOT NULL,
  `starts_at`    DATETIME(6)                                 NOT NULL,
  `ends_at`      DATETIME(6)                                         DEFAULT NULL,
  `reason`       VARCHAR(500)                                        DEFAULT NULL,
  `reopening_at` DATETIME(6)                                         DEFAULT NULL,
  `created_by`   CHAR(36)                                            DEFAULT NULL,
  `updated_by`   CHAR(36)                                            DEFAULT NULL,
  `created_at`   DATETIME(6)                                 NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`   DATETIME(6)                                 NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_oa_starts` (`starts_at`),
  KEY `idx_oa_window` (`starts_at`, `ends_at`, `status`),
  CONSTRAINT `chk_oa_ends` CHECK (`ends_at` IS NULL OR `ends_at` > `starts_at`),
  CONSTRAINT `chk_oa_reopen` CHECK (`reopening_at` IS NULL OR `reopening_at` >= `starts_at`),
  CONSTRAINT `fk_oa_created` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_oa_updated` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CHANGE POLLING CURSOR
-- Used by the polling endpoint to detect DB changes efficiently
-- ============================================================
CREATE TABLE IF NOT EXISTS `change_log` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `table_name` VARCHAR(100) NOT NULL,
  `row_id`     VARCHAR(36)          DEFAULT NULL,
  `operation`  ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_cl_table_created` (`table_name`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
