PRAGMA foreign_keys = ON;

CREATE TABLE `user` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `email_verified` integer DEFAULT false NOT NULL,
  `image` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);

CREATE TABLE `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);

CREATE TABLE `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);

CREATE TABLE `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);

CREATE TABLE `trip` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `location` text,
  `start_date` integer NOT NULL,
  `end_date` integer NOT NULL,
  `mode` text NOT NULL,
  `created_by_user_id` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `trip_membership` (
  `id` text PRIMARY KEY NOT NULL,
  `trip_id` text NOT NULL,
  `user_id` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `trip_membership_trip_id_user_id_unique` ON `trip_membership` (`trip_id`, `user_id`);
CREATE INDEX `trip_membership_trip_id_idx` ON `trip_membership` (`trip_id`);

CREATE TABLE `expense` (
  `id` text PRIMARY KEY NOT NULL,
  `trip_id` text NOT NULL,
  `title` text NOT NULL,
  `amount` integer NOT NULL,
  `date` integer NOT NULL,
  `split_type` text NOT NULL,
  `payer_membership_id` text,
  `note` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`payer_membership_id`) REFERENCES `trip_membership`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `expense_trip_id_idx` ON `expense` (`trip_id`);

CREATE TABLE `expense_split` (
  `id` text PRIMARY KEY NOT NULL,
  `expense_id` text NOT NULL,
  `membership_id` text NOT NULL,
  `amount` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`expense_id`) REFERENCES `expense`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`membership_id`) REFERENCES `trip_membership`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `expense_split_expense_id_membership_id_unique` ON `expense_split` (`expense_id`, `membership_id`);
CREATE INDEX `expense_split_expense_id_idx` ON `expense_split` (`expense_id`);

CREATE TABLE `contribution` (
  `id` text PRIMARY KEY NOT NULL,
  `trip_id` text NOT NULL,
  `membership_id` text NOT NULL,
  `amount` integer NOT NULL,
  `date` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`membership_id`) REFERENCES `trip_membership`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `contribution_trip_id_idx` ON `contribution` (`trip_id`);

CREATE TABLE `invitation` (
  `id` text PRIMARY KEY NOT NULL,
  `trip_id` text NOT NULL,
  `token` text NOT NULL,
  `role` text DEFAULT 'editor' NOT NULL,
  `max_uses` integer,
  `used_count` integer DEFAULT 0 NOT NULL,
  `expires_at` integer,
  `accepted_at` integer,
  `revoked_at` integer,
  `created_by_user_id` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (`trip_id`) REFERENCES `trip`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `invitation_token_unique` ON `invitation` (`token`);
