PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer NOT NULL,
	`deleted_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_notes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_notes`(`id`, `user_id`, `title`, `content`, `pinned`, `created_at`, `updated_at`, `synced_at`, `deleted_at`, `version`) SELECT `id`, `user_id`, `title`, `content`, `pinned`, `created_at`, `updated_at`, `synced_at`, `deleted_at`, `version` FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;