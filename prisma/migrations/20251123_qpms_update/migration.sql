-- Tables and alterations
CREATE TABLE IF NOT EXISTS `Subject` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Subject_code_key` (`code`)
);

ALTER TABLE `Question`
  ADD COLUMN `subjectCode` VARCHAR(191) NULL,
  ADD COLUMN `tags` JSON NULL,
  ADD COLUMN `subjectId` INT NULL,
  ADD CONSTRAINT `Question_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `CombinedQuestions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question1Id` INT NOT NULL,
  `question2Id` INT NOT NULL,
  `combinedText` TEXT NOT NULL,
  `marks` INT NOT NULL,
  `difficulty` VARCHAR(191) NOT NULL,
  `subjectId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `DeletedQuestionsLog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `questionId` INT NOT NULL,
  `text` TEXT NOT NULL,
  `deletedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);