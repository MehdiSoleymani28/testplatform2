import { AppDataSource } from './src/database/data-source';

async function createJoinTable() {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Check if the join table already exists
    const tableExists = await queryRunner.hasTable('api_collection_endpoints');
    if (!tableExists) {
      console.log('Creating api_collection_endpoints join table...');
      await queryRunner.query(`
        CREATE TABLE \`api_collection_endpoints\` (
          \`apiCollectionId\` int NOT NULL,
          \`apiEndpointId\` int NOT NULL,
          PRIMARY KEY (\`apiCollectionId\`, \`apiEndpointId\`),
          KEY \`IDX_api_collection_endpoints_apiCollectionId\` (\`apiCollectionId\`),
          KEY \`IDX_api_collection_endpoints_apiEndpointId\` (\`apiEndpointId\`),
          CONSTRAINT \`FK_api_collection_endpoints_apiCollectionId\` FOREIGN KEY (\`apiCollectionId\`) REFERENCES \`api_collection\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`FK_api_collection_endpoints_apiEndpointId\` FOREIGN KEY (\`apiEndpointId\`) REFERENCES \`api_endpoint\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Join table created successfully!');
    } else {
      console.log('Join table already exists.');
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating join table:', error);
  }
}

createJoinTable();
