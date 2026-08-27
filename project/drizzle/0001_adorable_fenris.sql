CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`countryCode` varchar(2) NOT NULL DEFAULT 'SA',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`launchStatus` enum('active','coming_soon','hidden') NOT NULL DEFAULT 'coming_soon',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `corporateInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(64) NOT NULL,
	`country` varchar(120) NOT NULL,
	`preferredCity` varchar(64) NOT NULL,
	`preferredHotels` text,
	`roomCount` int NOT NULL,
	`guestCount` int NOT NULL,
	`checkIn` varchar(16),
	`checkOut` varchar(16),
	`stayDuration` varchar(64),
	`notes` text,
	`locale` varchar(8) NOT NULL DEFAULT 'en',
	`ownerNotifiedAt` timestamp,
	`emailStatus` enum('deferred','sent','failed') NOT NULL DEFAULT 'deferred',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `corporateInquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelAmenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`localeContent` json,
	CONSTRAINT `hotelAmenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelGalleries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`altText` text,
	`rightsStatus` enum('partner_authorized','licensed','generated') NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `hotelGalleries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`occupancy` int NOT NULL DEFAULT 2,
	`sizeSqm` int,
	`bedConfiguration` varchar(255),
	`localeContent` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hotelRooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotelTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`locale` varchar(8) NOT NULL,
	`name` varchar(255) NOT NULL,
	`shortDescription` text,
	`longDescription` text,
	`address` text,
	`metaTitle` varchar(255),
	`metaDescription` text,
	CONSTRAINT `hotelTranslations_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotel_locale_unique` UNIQUE(`hotelId`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`slug` varchar(128) NOT NULL,
	`category` enum('premium','executive','value') NOT NULL DEFAULT 'executive',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`officialWebsiteUrl` varchar(512),
	`portfolioStatus` enum('draft','verified','published') NOT NULL DEFAULT 'draft',
	`corporateReady` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotels_slug_unique` UNIQUE(`slug`)
);
