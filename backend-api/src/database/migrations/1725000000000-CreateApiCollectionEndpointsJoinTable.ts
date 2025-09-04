import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiCollectionEndpointsJoinTable1725000000000 implements MigrationInterface {
  name = 'CreateApiCollectionEndpointsJoinTable1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the join table for many-to-many relationship between api_collection and api_endpoint
    await queryRunner.query(`
      CREATE TABLE \`api_collection_endpoints\` (
        \`apiCollectionId\` int NOT NULL,
        \`apiEndpointId\` int NOT NULL,
        PRIMARY KEY (\`apiCollectionId\`, \`apiEndpointId\`),
        INDEX \`IDX_api_collection_endpoints_collection\` (\`apiCollectionId\`),
        INDEX \`IDX_api_collection_endpoints_endpoint\` (\`apiEndpointId\`),
        CONSTRAINT \`FK_api_collection_endpoints_collection\` FOREIGN KEY (\`apiCollectionId\`) REFERENCES \`api_collection\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_api_collection_endpoints_endpoint\` FOREIGN KEY (\`apiEndpointId\`) REFERENCES \`api_endpoint\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`api_collection_endpoints\``);
  }
}
