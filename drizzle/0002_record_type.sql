ALTER TABLE `expense` ADD COLUMN `record_type` text NOT NULL DEFAULT 'general';

UPDATE `expense`
SET `record_type` = (
  SELECT CASE
    WHEN `trip`.`mode` = 'pool' THEN 'pool'
    ELSE 'general'
  END
  FROM `trip`
  WHERE `trip`.`id` = `expense`.`trip_id`
);
