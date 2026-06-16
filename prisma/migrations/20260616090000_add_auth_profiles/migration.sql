-- AlterTable
ALTER TABLE `users` CHANGE `passwordHash` `password` VARCHAR(255) NOT NULL;
ALTER TABLE `users` ADD COLUMN `status` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'PENDING';
UPDATE `users`
SET `status` = CASE
    WHEN `isActive` = true THEN 'APPROVED'
    ELSE 'REJECTED'
END;

ALTER TABLE `users` ADD COLUMN `role_tmp` ENUM('STUDENT', 'LANDLORD', 'ADMIN') NOT NULL DEFAULT 'STUDENT';
UPDATE `users`
SET `role_tmp` = CASE `role`
    WHEN 'owner' THEN 'LANDLORD'
    WHEN 'admin' THEN 'ADMIN'
    ELSE 'STUDENT'
END;
ALTER TABLE `users` DROP COLUMN `role`;
ALTER TABLE `users` CHANGE `role_tmp` `role` ENUM('STUDENT', 'LANDLORD', 'ADMIN') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `student_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `university` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `student_profiles_userId_key`(`userId`),
    INDEX `student_profiles_university_idx`(`university`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `landlord_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessName` VARCHAR(150) NOT NULL,
    `businessLicenseImage` VARCHAR(500) NOT NULL,
    `verifiedAt` DATETIME(3) NULL,

    UNIQUE INDEX `landlord_profiles_userId_key`(`userId`),
    INDEX `landlord_profiles_businessName_idx`(`businessName`),
    INDEX `landlord_profiles_verifiedAt_idx`(`verifiedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `users_role_idx` ON `users`(`role`);
CREATE INDEX `users_status_idx` ON `users`(`status`);

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `landlord_profiles` ADD CONSTRAINT `landlord_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
