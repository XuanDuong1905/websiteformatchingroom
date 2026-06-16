-- Store Member 5 matching preferences that are submitted by ProfileForm.
ALTER TABLE `lifestyle_profiles`
  ADD COLUMN `preferredGender` ENUM('male', 'female', 'any') NOT NULL DEFAULT 'any',
  ADD COLUMN `acceptSmoking` BOOLEAN NOT NULL DEFAULT false;
