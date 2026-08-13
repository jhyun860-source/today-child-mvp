CREATE TABLE `recipeIngredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int NOT NULL,
	`sortOrder` int NOT NULL,
	`amount` decimal(8,2) NOT NULL,
	`unit` varchar(24) NOT NULL,
	`item` varchar(160) NOT NULL,
	`note` varchar(240),
	CONSTRAINT `recipeIngredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipeSteps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int NOT NULL,
	`sortOrder` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`detail` text NOT NULL,
	`timerSeconds` int,
	CONSTRAINT `recipeSteps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdById` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`koreanName` varchar(120),
	`category` varchar(40) NOT NULL DEFAULT 'Classics',
	`base` varchar(80) NOT NULL,
	`tasteTags` text,
	`method` varchar(40) NOT NULL,
	`serviceTimeSeconds` int NOT NULL DEFAULT 120,
	`description` text,
	`glass` varchar(80) NOT NULL,
	`garnish` varchar(120) NOT NULL,
	`imageUrl` text,
	`imageKey` varchar(512),
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `recipeIngredients` ADD CONSTRAINT `recipeIngredients_recipeId_recipes_id_fk` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recipeSteps` ADD CONSTRAINT `recipeSteps_recipeId_recipes_id_fk` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `recipe_ingredients_recipe_idx` ON `recipeIngredients` (`recipeId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `recipe_steps_recipe_idx` ON `recipeSteps` (`recipeId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `recipes_status_idx` ON `recipes` (`status`);--> statement-breakpoint
CREATE INDEX `recipes_created_by_idx` ON `recipes` (`createdById`);