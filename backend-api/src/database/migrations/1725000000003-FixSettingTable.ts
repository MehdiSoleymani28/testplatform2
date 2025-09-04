import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSettingTable1725000000003 implements MigrationInterface {
  name = 'FixSettingTable1725000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the table exists
    const tableExists = await queryRunner.hasTable('setting');
    if (!tableExists) {
      // Create the table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`setting\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`key\` varchar(255) NOT NULL,
          \`value\` text NOT NULL,
          \`project_id\` int NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    } else {
      // Add project_id column if it doesn't exist
      const hasProjectId = await queryRunner.hasColumn('setting', 'project_id');
      if (!hasProjectId) {
        await queryRunner.query(`
          ALTER TABLE \`setting\`
          ADD COLUMN \`project_id\` int NULL
        `);
      }
    }

    // Add indexes and foreign key
    await queryRunner.query(`
      ALTER TABLE \`setting\` 
      ADD INDEX \`IDX_setting_project_id\` (\`project_id\`),
      ADD CONSTRAINT \`FK_setting_project\` 
      FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
    `);

    // Add unique index for key + project_id
    await queryRunner.query(`
      ALTER TABLE \`setting\` 
      ADD UNIQUE INDEX \`IDX_setting_key_project\` (\`key\`, \`project_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes and foreign key
    await queryRunner.query(`ALTER TABLE \`setting\` DROP INDEX \`IDX_setting_key_project\``);
    await queryRunner.query(`ALTER TABLE \`setting\` DROP FOREIGN KEY \`FK_setting_project\``);
    await queryRunner.query(`ALTER TABLE \`setting\` DROP INDEX \`IDX_setting_project_id\``);
    
    // Remove project_id column
    await queryRunner.query(`ALTER TABLE \`setting\` DROP COLUMN \`project_id\``);
  }
}
