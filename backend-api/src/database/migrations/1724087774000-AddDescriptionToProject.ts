import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToProject1724087774000 implements MigrationInterface {
  name = 'AddDescriptionToProject1724087774000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add description column to project table
    await queryRunner.query(`
      ALTER TABLE \`project\`
      ADD COLUMN \`description\` text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove description column from project table
    await queryRunner.query(`
      ALTER TABLE \`project\`
      DROP COLUMN \`description\`
    `);
  }
}
