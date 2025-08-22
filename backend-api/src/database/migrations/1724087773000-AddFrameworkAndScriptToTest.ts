import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFrameworkAndScriptToTest1724087773000 implements MigrationInterface {
  name = 'AddFrameworkAndScriptToTest1724087773000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add framework column to test table
    await queryRunner.query(`
      ALTER TABLE \`test\`
      ADD COLUMN \`framework\` varchar(50) NULL
    `);

    // Add script column to test table
    await queryRunner.query(`
      ALTER TABLE \`test\`
      ADD COLUMN \`script\` text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove script column from test table
    await queryRunner.query(`
      ALTER TABLE \`test\`
      DROP COLUMN \`script\`
    `);

    // Remove framework column from test table
    await queryRunner.query(`
      ALTER TABLE \`test\`
      DROP COLUMN \`framework\`
    `);
  }
}
