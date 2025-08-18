import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = 'CreateInitialTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create projects table
    await queryRunner.query(`
      CREATE TABLE \`project\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`baseUrl\` varchar(255) NOT NULL,
        \`createdAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create pages table
    await queryRunner.query(`
      CREATE TABLE \`page\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`url\` varchar(255) NOT NULL,
        \`projectId\` int NULL,
        \`createdAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_page_projectId\` (\`projectId\`),
        CONSTRAINT \`FK_page_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create tests table
    await queryRunner.query(`
      CREATE TABLE \`test\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'pending',
        \`projectId\` int NULL,
        \`pageId\` int NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_test_projectId\` (\`projectId\`),
        INDEX \`IDX_test_pageId\` (\`pageId\`),
        CONSTRAINT \`FK_test_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_test_page\` FOREIGN KEY (\`pageId\`) REFERENCES \`page\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create logs table
    await queryRunner.query(`
      CREATE TABLE \`log\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`level\` varchar(50) NOT NULL,
        \`message\` text NOT NULL,
        \`timestamp\` datetime NOT NULL,
        \`testId\` int NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_log_testId\` (\`testId\`),
        CONSTRAINT \`FK_log_test\` FOREIGN KEY (\`testId\`) REFERENCES \`test\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create settings table
    await queryRunner.query(`
      CREATE TABLE \`setting\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`key\` varchar(255) NOT NULL UNIQUE,
        \`value\` text NOT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create api_endpoints table
    await queryRunner.query(`
      CREATE TABLE \`api_endpoint\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`url\` varchar(255) NOT NULL,
        \`method\` varchar(10) NOT NULL,
        \`headers\` json NULL,
        \`body\` text NULL,
        \`projectId\` int NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_api_endpoint_projectId\` (\`projectId\`),
        CONSTRAINT \`FK_api_endpoint_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create api_collections table
    await queryRunner.query(`
      CREATE TABLE \`api_collection\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`projectId\` int NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_api_collection_projectId\` (\`projectId\`),
        CONSTRAINT \`FK_api_collection_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create ai_models table
    await queryRunner.query(`
      CREATE TABLE \`ai_model\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`config\` json NULL,
        \`isActive\` boolean NOT NULL DEFAULT true,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create saved_tests table
    await queryRunner.query(`
      CREATE TABLE \`saved_test\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`testData\` json NOT NULL,
        \`projectId\` int NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_saved_test_projectId\` (\`projectId\`),
        CONSTRAINT \`FK_saved_test_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create scanner table
    await queryRunner.query(`
      CREATE TABLE \`scanner\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`config\` json NULL,
        \`isActive\` boolean NOT NULL DEFAULT true,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create test_generator table
    await queryRunner.query(`
      CREATE TABLE \`test_generator\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`config\` json NULL,
        \`isActive\` boolean NOT NULL DEFAULT true,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE \`test_generator\``);
    await queryRunner.query(`DROP TABLE \`scanner\``);
    await queryRunner.query(`DROP TABLE \`saved_test\``);
    await queryRunner.query(`DROP TABLE \`ai_model\``);
    await queryRunner.query(`DROP TABLE \`api_collection\``);
    await queryRunner.query(`DROP TABLE \`api_endpoint\``);
    await queryRunner.query(`DROP TABLE \`setting\``);
    await queryRunner.query(`DROP TABLE \`log\``);
    await queryRunner.query(`DROP TABLE \`test\``);
    await queryRunner.query(`DROP TABLE \`page\``);
    await queryRunner.query(`DROP TABLE \`project\``);
  }
}
