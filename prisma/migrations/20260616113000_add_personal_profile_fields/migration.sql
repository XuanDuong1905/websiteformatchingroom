-- Add optional fields used by the personal information page.
ALTER TABLE `user_profiles`
  ADD COLUMN `dateOfBirth` DATE NULL AFTER `birthYear`,
  ADD COLUMN `occupation` VARCHAR(150) NULL AFTER `dateOfBirth`;

ALTER TABLE `landlord_profiles`
  ADD COLUMN `identityNumber` VARCHAR(50) NULL AFTER `businessLicenseImage`;

CREATE INDEX `landlord_profiles_identityNumber_idx` ON `landlord_profiles`(`identityNumber`);
