ALTER TABLE `trip` ADD COLUMN `currency` text NOT NULL DEFAULT 'TWD';

ALTER TABLE `expense` ADD COLUMN `currency` text NOT NULL DEFAULT 'TWD';
ALTER TABLE `expense` ADD COLUMN `exchange_rate_to_base` real NOT NULL DEFAULT 1;
ALTER TABLE `expense` ADD COLUMN `settlement_amount` integer NOT NULL DEFAULT 0;
UPDATE `expense` SET `settlement_amount` = `amount`;

ALTER TABLE `contribution` ADD COLUMN `currency` text NOT NULL DEFAULT 'TWD';
ALTER TABLE `contribution` ADD COLUMN `exchange_rate_to_base` real NOT NULL DEFAULT 1;
ALTER TABLE `contribution` ADD COLUMN `settlement_amount` integer NOT NULL DEFAULT 0;
UPDATE `contribution` SET `settlement_amount` = `amount`;
