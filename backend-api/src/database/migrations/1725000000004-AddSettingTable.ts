import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingTable1725000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS \`setting\`;
      
      CREATE TABLE \`setting\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`key\` varchar(255) NOT NULL,
        \`value\` text NOT NULL,
        \`project_id\` int NULL,
        UNIQUE INDEX \`IDX_setting_key_project\` (\`key\`, \`project_id\`),
        INDEX \`IDX_setting_project_id\` (\`project_id\`),
        FOREIGN KEY (\`project_id\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`setting\``);
  }
}
