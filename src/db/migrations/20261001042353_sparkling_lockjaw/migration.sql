CREATE TABLE `purged_notes` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`purged_at` integer NOT NULL,
	CONSTRAINT `purged_notes_pk` PRIMARY KEY(`note_id`, `user_id`),
	CONSTRAINT `fk_purged_notes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
