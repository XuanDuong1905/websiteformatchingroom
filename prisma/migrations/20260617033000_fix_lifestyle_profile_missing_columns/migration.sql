-- Keep the real database aligned with prisma/schema.prisma for Member 5 profile form.
ALTER TABLE `lifestyle_profiles`
  ADD COLUMN `preferredGender` ENUM('male', 'female', 'any') NOT NULL DEFAULT 'any',
  ADD COLUMN `acceptSmoking` BOOLEAN NOT NULL DEFAULT false;
