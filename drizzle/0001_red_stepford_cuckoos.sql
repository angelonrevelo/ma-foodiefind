CREATE TABLE `cravings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`userId` int NOT NULL,
	`craving` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cravings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roomMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(8) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `searchResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`googlePlaceId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`latitude` varchar(20) NOT NULL,
	`longitude` varchar(20) NOT NULL,
	`rating` varchar(10),
	`userRatingCount` int,
	`photoUrl` text,
	`websiteUrl` text,
	`hasDelivery` int DEFAULT 0,
	`hasDineIn` int DEFAULT 0,
	`hasGrab` int DEFAULT 0,
	`hasFoodpanda` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roomId` int NOT NULL,
	`latitude` varchar(20) NOT NULL,
	`longitude` varchar(20) NOT NULL,
	`address` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLocations_id` PRIMARY KEY(`id`)
);
