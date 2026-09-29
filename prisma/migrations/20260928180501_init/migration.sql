-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resumes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `parent_resume_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `resumes_user_id_idx`(`user_id`),
    INDEX `resumes_parent_resume_id_idx`(`parent_resume_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_versions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resume_id` INTEGER NOT NULL,
    `version_number` INTEGER NOT NULL,
    `content_json` JSON NOT NULL,
    `ats_score` DECIMAL(5, 2) NULL,
    `created_by` ENUM('USER', 'AI', 'SYSTEM') NOT NULL,
    `change_summary` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resume_versions_resume_id_created_at_idx`(`resume_id`, `created_at`),
    UNIQUE INDEX `resume_versions_resume_id_version_number_key`(`resume_id`, `version_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_changes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resume_id` INTEGER NOT NULL,
    `version_id` INTEGER NOT NULL,
    `section` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(150) NULL,
    `instruction` TEXT NOT NULL,
    `original_content` TEXT NOT NULL,
    `new_content` TEXT NOT NULL,
    `reason` TEXT NULL,
    `model` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_changes_resume_id_idx`(`resume_id`),
    INDEX `ai_changes_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_annotations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resume_id` INTEGER NOT NULL,
    `version_id` INTEGER NOT NULL,
    `section` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(150) NULL,
    `instruction` TEXT NULL,
    `coordinates_json` JSON NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    INDEX `resume_annotations_resume_id_idx`(`resume_id`),
    INDEX `resume_annotations_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ats_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resume_id` INTEGER NOT NULL,
    `version_id` INTEGER NOT NULL,
    `overall_score` DECIMAL(5, 2) NOT NULL,
    `content_score` DECIMAL(5, 2) NULL,
    `keyword_score` DECIMAL(5, 2) NULL,
    `formatting_score` DECIMAL(5, 2) NULL,
    `structure_score` DECIMAL(5, 2) NULL,
    `missing_keywords_json` JSON NOT NULL,
    `issues_json` JSON NOT NULL,
    `suggestions_json` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ats_reports_resume_id_idx`(`resume_id`),
    INDEX `ats_reports_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resume_id` INTEGER NOT NULL,
    `version_id` INTEGER NOT NULL,
    `job_title` VARCHAR(200) NULL,
    `company` VARCHAR(200) NULL,
    `job_description` LONGTEXT NOT NULL,
    `match_score` DECIMAL(5, 2) NOT NULL,
    `matched_keywords_json` JSON NOT NULL,
    `missing_keywords_json` JSON NOT NULL,
    `weak_keywords_json` JSON NOT NULL,
    `suggestions_json` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `job_matches_resume_id_idx`(`resume_id`),
    INDEX `job_matches_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `resume_id` INTEGER NULL,
    `version_id` INTEGER NULL,
    `file_type` ENUM('ORIGINAL_UPLOAD', 'GENERATED_PDF', 'GENERATED_DOCX') NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `storage_key` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `files_storage_key_key`(`storage_key`),
    INDEX `files_user_id_idx`(`user_id`),
    INDEX `files_resume_id_idx`(`resume_id`),
    INDEX `files_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_exports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `resume_id` INTEGER NOT NULL,
    `version_id` INTEGER NOT NULL,
    `file_id` INTEGER NOT NULL,
    `format` ENUM('PDF', 'DOCX') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resume_exports_user_id_idx`(`user_id`),
    INDEX `resume_exports_resume_id_idx`(`resume_id`),
    INDEX `resume_exports_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_parent_resume_id_fkey` FOREIGN KEY (`parent_resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_versions` ADD CONSTRAINT `resume_versions_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_changes` ADD CONSTRAINT `ai_changes_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_changes` ADD CONSTRAINT `ai_changes_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_annotations` ADD CONSTRAINT `resume_annotations_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_annotations` ADD CONSTRAINT `resume_annotations_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ats_reports` ADD CONSTRAINT `ats_reports_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ats_reports` ADD CONSTRAINT `ats_reports_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_matches` ADD CONSTRAINT `job_matches_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_matches` ADD CONSTRAINT `job_matches_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_exports` ADD CONSTRAINT `resume_exports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_exports` ADD CONSTRAINT `resume_exports_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_exports` ADD CONSTRAINT `resume_exports_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_exports` ADD CONSTRAINT `resume_exports_file_id_fkey` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
