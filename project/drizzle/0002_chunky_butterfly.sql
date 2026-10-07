CREATE TABLE `hotelEditorialNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`locale` varchar(8) NOT NULL DEFAULT 'en',
	`note` text NOT NULL,
	`sourceStatus` enum('planning','official','partner_verified') NOT NULL DEFAULT 'planning',
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hotelEditorialNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `hotelGalleries` ADD `storageKey` varchar(1024);--> statement-breakpoint
ALTER TABLE `hotelGalleries` ADD `rightsEvidence` text;--> statement-breakpoint
ALTER TABLE `hotelGalleries` ADD `reviewStatus` enum('pending_review','approved') DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `hotelGalleries` ADD `uploadedByUserId` int;--> statement-breakpoint
ALTER TABLE `hotelGalleries` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `directoryZone` varchar(64);--> statement-breakpoint
ALTER TABLE `hotels` ADD `sourceStatus` enum('planning','official','partner_verified') DEFAULT 'planning' NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `sourceNote` text;--> statement-breakpoint
ALTER TABLE `hotels` ADD `distanceEstimate` varchar(64);--> statement-breakpoint
ALTER TABLE `hotels` ADD `walkingEstimate` varchar(64);--> statement-breakpoint
ALTER TABLE `hotels` ADD `vehicleEstimate` varchar(64);--> statement-breakpoint
ALTER TABLE `hotels` ADD `accessMode` enum('walkable','transfer_advised');