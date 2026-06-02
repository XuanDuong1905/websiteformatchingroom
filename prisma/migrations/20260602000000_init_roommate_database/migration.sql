-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `gender` ENUM('male', 'female', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
    `role` ENUM('student', 'owner', 'admin') NOT NULL DEFAULT 'student',
    `reputationScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `schoolName` VARCHAR(150) NULL,
    `major` VARCHAR(150) NULL,
    `birthYear` INTEGER NULL,
    `currentAddress` VARCHAR(255) NULL,
    `preferredDistrict` VARCHAR(100) NULL,
    `bio` TEXT NULL,
    `privacyLevel` ENUM('low', 'medium', 'high', 'unknown') NOT NULL DEFAULT 'unknown',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lifestyle_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `budgetMin` INTEGER NULL,
    `budgetMax` INTEGER NULL,
    `sleepTime` TIME(0) NULL,
    `wakeTime` TIME(0) NULL,
    `cleaningFrequency` ENUM('daily', 'weekly', 'monthly', 'rarely', 'unknown') NOT NULL DEFAULT 'unknown',
    `noiseTolerance` ENUM('low', 'medium', 'high', 'unknown') NOT NULL DEFAULT 'unknown',
    `privacyPreference` ENUM('low', 'medium', 'high', 'unknown') NOT NULL DEFAULT 'unknown',
    `smoking` BOOLEAN NOT NULL DEFAULT false,
    `petFriendly` BOOLEAN NOT NULL DEFAULT false,
    `guestFrequency` ENUM('never', 'rarely', 'sometimes', 'often', 'unknown') NOT NULL DEFAULT 'unknown',
    `cookingFrequency` ENUM('never', 'rarely', 'sometimes', 'often', 'unknown') NOT NULL DEFAULT 'unknown',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lifestyle_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerId` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `address` VARCHAR(255) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `ward` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `price` INTEGER NOT NULL,
    `deposit` INTEGER NOT NULL DEFAULT 0,
    `area` DECIMAL(6, 2) NULL,
    `electricityFee` INTEGER NOT NULL DEFAULT 0,
    `waterFee` INTEGER NOT NULL DEFAULT 0,
    `wifiFee` INTEGER NOT NULL DEFAULT 0,
    `parkingFee` INTEGER NOT NULL DEFAULT 0,
    `otherFee` INTEGER NOT NULL DEFAULT 0,
    `maxPeople` INTEGER NOT NULL DEFAULT 1,
    `currentPeople` INTEGER NOT NULL DEFAULT 0,
    `availableSlots` INTEGER NOT NULL DEFAULT 1,
    `hasContract` BOOLEAN NOT NULL DEFAULT false,
    `minStayMonths` INTEGER NOT NULL DEFAULT 1,
    `availableFrom` DATE NULL,
    `verificationStatus` ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified',
    `riskScore` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'pending', 'active', 'rented', 'hidden', 'warning', 'deleted') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rooms_ownerId_idx`(`ownerId`),
    INDEX `rooms_district_idx`(`district`),
    INDEX `rooms_price_idx`(`price`),
    INDEX `rooms_status_idx`(`status`),
    INDEX `rooms_riskScore_idx`(`riskScore`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `cloudinaryPublicId` VARCHAR(255) NULL,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `room_images_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `amenities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `amenities_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_amenities` (
    `roomId` INTEGER NOT NULL,
    `amenityId` INTEGER NOT NULL,

    PRIMARY KEY (`roomId`, `amenityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `allowSmoking` BOOLEAN NOT NULL DEFAULT false,
    `allowPet` BOOLEAN NOT NULL DEFAULT false,
    `allowGuest` BOOLEAN NOT NULL DEFAULT false,
    `curfewTime` TIME(0) NULL,
    `cookingAllowed` BOOLEAN NOT NULL DEFAULT true,
    `parkingAllowed` BOOLEAN NOT NULL DEFAULT false,
    `note` TEXT NULL,

    UNIQUE INDEX `room_rules_roomId_key`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `targetDistrict` VARCHAR(100) NULL,
    `budgetMin` INTEGER NULL,
    `budgetMax` INTEGER NULL,
    `maxDistanceKm` DECIMAL(5, 2) NULL,
    `schoolOrWorkplace` VARCHAR(255) NULL,
    `needContract` BOOLEAN NOT NULL DEFAULT false,
    `needParking` BOOLEAN NOT NULL DEFAULT false,
    `needPrivateWc` BOOLEAN NOT NULL DEFAULT false,
    `preferredMoveInDate` DATE NULL,
    `status` ENUM('active', 'paused', 'closed') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `search_requests_userId_idx`(`userId`),
    INDEX `search_requests_targetDistrict_idx`(`targetDistrict`),
    INDEX `search_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matching_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `matchedUserId` INTEGER NULL,
    `roomId` INTEGER NULL,
    `budgetScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `locationScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `lifestyleScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `amenityScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `trustScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `compatibilityScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `riskScore` INTEGER NOT NULL DEFAULT 0,
    `finalScore` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `reason` TEXT NULL,
    `status` ENUM('suggested', 'viewed', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'suggested',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `matching_results_requestId_idx`(`requestId`),
    INDEX `matching_results_userId_idx`(`userId`),
    INDEX `matching_results_matchedUserId_idx`(`matchedUserId`),
    INDEX `matching_results_roomId_idx`(`roomId`),
    INDEX `matching_results_finalScore_idx`(`finalScore`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reviewerId` INTEGER NOT NULL,
    `reviewedUserId` INTEGER NULL,
    `roomId` INTEGER NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `reviewType` ENUM('room', 'roommate', 'owner') NOT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reviews_reviewerId_idx`(`reviewerId`),
    INDEX `reviews_reviewedUserId_idx`(`reviewedUserId`),
    INDEX `reviews_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporterId` INTEGER NOT NULL,
    `roomId` INTEGER NULL,
    `reportedUserId` INTEGER NULL,
    `riskType` ENUM('fake_post', 'wrong_information', 'hidden_cost', 'unclear_contract', 'deposit_scam', 'bad_roommate_behavior', 'unsafe_location', 'other') NOT NULL,
    `description` TEXT NOT NULL,
    `evidenceUrl` VARCHAR(500) NULL,
    `severity` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `status` ENUM('pending', 'reviewing', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    `handledBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `risk_reports_reporterId_idx`(`reporterId`),
    INDEX `risk_reports_reportedUserId_idx`(`reportedUserId`),
    INDEX `risk_reports_handledBy_idx`(`handledBy`),
    INDEX `risk_reports_roomId_idx`(`roomId`),
    INDEX `risk_reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lifestyle_profiles` ADD CONSTRAINT `lifestyle_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_images` ADD CONSTRAINT `room_images_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_rules` ADD CONSTRAINT `room_rules_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `search_requests` ADD CONSTRAINT `search_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matching_results` ADD CONSTRAINT `matching_results_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `search_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matching_results` ADD CONSTRAINT `matching_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matching_results` ADD CONSTRAINT `matching_results_matchedUserId_fkey` FOREIGN KEY (`matchedUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matching_results` ADD CONSTRAINT `matching_results_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewedUserId_fkey` FOREIGN KEY (`reviewedUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_reports` ADD CONSTRAINT `risk_reports_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_reports` ADD CONSTRAINT `risk_reports_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_reports` ADD CONSTRAINT `risk_reports_handledBy_fkey` FOREIGN KEY (`handledBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_reports` ADD CONSTRAINT `risk_reports_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
