import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequirementsToPage1724087771000 implements MigrationInterface {
  name = 'AddRequirementsToPage1724087771000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`page\` 
      ADD COLUMN \`requirements\` TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`page\` 
      DROP COLUMN \`requirements\`
    `);
  }
}
