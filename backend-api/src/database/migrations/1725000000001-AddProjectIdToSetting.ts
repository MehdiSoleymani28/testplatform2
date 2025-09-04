import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIdToSetting1725000000001 implements MigrationInterface {
  name = 'AddProjectIdToSetting1725000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if index exists before trying to drop it
    const [indexes] = await queryRunner.query(
      `SHOW INDEXES FROM \`setting\` WHERE Key_name = 'key'`
    );
    if (indexes && indexes.length > 0) {
      await queryRunner.query(`ALTER TABLE \`setting\` DROP INDEX \`key\``);
    }

    // Add project_id column
    await queryRunner.query(`ALTER TABLE \`setting\` ADD COLUMN \`project_id\` int NULL`);

    // Add foreign key and indexes
    await queryRunner.query(`
      ALTER TABLE \`setting\` 
      ADD INDEX \`IDX_setting_project_id\` (\`project_id\`),
      ADD CONSTRAINT \`FK_setting_project\` 
      FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE
    `);
    
    // Add unique constraint for key + project_id combination
    await queryRunner.query(`
      ALTER TABLE \`setting\` 
      ADD UNIQUE INDEX \`IDX_setting_key_project\` (\`key\`, \`project_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove unique constraint for key + project_id combination
    await queryRunner.query(`ALTER TABLE \`setting\` DROP INDEX \`IDX_setting_key_project\``);
    
    // Remove project_id foreign key and column
    await queryRunner.query(`ALTER TABLE \`setting\` DROP FOREIGN KEY \`FK_setting_project\``);
    await queryRunner.query(`ALTER TABLE \`setting\` DROP INDEX \`IDX_setting_project_id\``);
    await queryRunner.query(`ALTER TABLE \`setting\` DROP COLUMN \`project_id\``);
    
    // Add back the unique constraint on key column
    await queryRunner.query(`ALTER TABLE \`setting\` ADD UNIQUE INDEX \`key\` (\`key\`)`);
  }
}
