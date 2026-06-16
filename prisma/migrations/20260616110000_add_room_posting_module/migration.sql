-- Add city to room postings and align room posting status values.
ALTER TABLE `rooms`
  ADD COLUMN `city` VARCHAR(100) NOT NULL DEFAULT 'TP. Ho Chi Minh' AFTER `district`;

UPDATE `rooms`
SET `city` = 'TP. Ho Chi Minh'
WHERE `city` IS NULL OR `city` = '';

UPDATE `rooms`
SET `description` = ''
WHERE `description` IS NULL;

UPDATE `rooms`
SET `area` = 0
WHERE `area` IS NULL;

ALTER TABLE `rooms`
  MODIFY `description` TEXT NOT NULL,
  MODIFY `area` DECIMAL(6, 2) NOT NULL,
  MODIFY `status` ENUM(
    'active',
    'inactive',
    'rented',
    'draft',
    'pending',
    'hidden',
    'warning',
    'deleted'
  ) NOT NULL DEFAULT 'active';

CREATE INDEX `rooms_city_idx` ON `rooms`(`city`);
