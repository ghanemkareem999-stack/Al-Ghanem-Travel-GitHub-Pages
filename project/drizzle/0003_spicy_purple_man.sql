ALTER TABLE `hotels` ADD `googleMapsPlaceUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `hotels` ADD `locationVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `hotels` ADD `routeVerifiedAt` timestamp;