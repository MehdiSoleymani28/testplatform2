import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateSetting1725000000002 implements MigrationInterface {
  name = 'RecreateSetting1725000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing setting table if exists
    await queryRunner.query(`DROP TABLE IF EXISTS \`setting\``);

    // Create setting table with all required columns
    await queryRunner.query(`
      CREATE TABLE \`setting\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`key\` varchar(255) NOT NULL,
        \`value\` text NOT NULL,
        \`project_id\` int NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_setting_project_id\` (\`project_id\`),
        UNIQUE INDEX \`IDX_setting_key_project\` (\`key\`, \`project_id\`),
        CONSTRAINT \`FK_setting_project\` 
        FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`setting\``);
  }
}
