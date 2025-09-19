CREATE TABLE `attendances` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`device_id` bigint,
	`method` enum('fake-emulator','real-device','webauthn','qr') NOT NULL DEFAULT 'fake-emulator',
	`check_type` enum('in','out') NOT NULL,
	`check_at` timestamp NOT NULL DEFAULT (now()),
	`score` float,
	`meta` json,
	`status` enum('present','absent') DEFAULT 'present',
	CONSTRAINT `attendances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendances_absent` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`employee_id` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`reason` varchar(255) DEFAULT 'لم يسجل بصمة',
	CONSTRAINT `attendances_absent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendances_present` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`employee_id` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`check_type` enum('in','out') NOT NULL,
	`check_at` timestamp NOT NULL DEFAULT (now()),
	`status` enum('present','late') NOT NULL,
	CONSTRAINT `attendances_present_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `department` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`sectionId` int,
	CONSTRAINT `department_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`privilege` varchar(191) NOT NULL,
	`sectionId` int NOT NULL,
	`departmentId` int NOT NULL,
	CONSTRAINT `employee_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fingerprint_devices` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`name` varchar(255),
	`template_base64` text NOT NULL,
	`template_hash` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fingerprint_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `infosystem` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text,
	`userId` int NOT NULL,
	`doneby` varchar(100) DEFAULT '',
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `infosystem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	CONSTRAINT `section_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeallowenc` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`reason` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`employeeId` int NOT NULL,
	`departmentId` int NOT NULL,
	`sectionId` int NOT NULL,
	CONSTRAINT `timeallowenc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`password` varchar(191) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vacations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`departmentId` int NOT NULL,
	`sectionId` int NOT NULL,
	`dateStart` date NOT NULL,
	`dateEnd` date NOT NULL,
	`reason` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `vacations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vacation_balance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 2,
	`lastUpdatedMonth` int NOT NULL DEFAULT 9,
	`updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `vacation_balance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workingdays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(50) NOT NULL,
	`startshift` time NOT NULL,
	`endshift` time NOT NULL,
	`employeeId` int NOT NULL,
	CONSTRAINT `workingdays_id` PRIMARY KEY(`id`)
);
