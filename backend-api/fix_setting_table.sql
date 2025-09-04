-- Drop the existing table
DROP TABLE IF EXISTS `setting`;

-- Create the table with the correct structure
CREATE TABLE `setting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `project_id` int NULL,
  UNIQUE INDEX `IDX_setting_key_project` (`key`, `project_id`),
  INDEX `IDX_setting_project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
