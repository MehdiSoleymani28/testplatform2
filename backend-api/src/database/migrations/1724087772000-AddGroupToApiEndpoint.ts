import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupToApiEndpoint1724087772000 implements MigrationInterface {
  name = 'AddGroupToApiEndpoint1724087772000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add group column to api_endpoint table
    await queryRunner.query(`
      ALTER TABLE \`api_endpoint\`
      ADD COLUMN \`group\` varchar(255) NULL
    `);

    // Add requirements column to api_endpoint table
    await queryRunner.query(`
      ALTER TABLE \`api_endpoint\`
      ADD COLUMN \`requirements\` text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove requirements column
    await queryRunner.query(`
      ALTER TABLE \`api_endpoint\`
      DROP COLUMN \`requirements\`
    `);

    // Remove group column
    await queryRunner.query(`
      ALTER TABLE \`api_endpoint\`
      DROP COLUMN \`group\`
    `);
  }
}
