import { AppDataSource } from './src/database/data-source';
import { QueryRunner } from 'typeorm';

async function runMigrationsSafe() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Checking and applying migrations safely...');

    // Check if 'framework' column exists in 'test' table
    const frameworkExists = await checkColumnExists(queryRunner, 'test', 'framework');
    const scriptExists = await checkColumnExists(queryRunner, 'test', 'script');

    if (!frameworkExists) {
      console.log('Adding framework column to test table...');
      await queryRunner.query(`
        ALTER TABLE \`test\`
        ADD COLUMN \`framework\` varchar(50) NULL
      `);
    } else {
      console.log('Framework column already exists, skipping...');
    }

    if (!scriptExists) {
      console.log('Adding script column to test table...');
      await queryRunner.query(`
        ALTER TABLE \`test\`
        ADD COLUMN \`script\` text NULL
      `);
    } else {
      console.log('Script column already exists, skipping...');
    }

    // Check if 'group' and 'requirements' columns exist in 'api_endpoint' table
    const groupExists = await checkColumnExists(queryRunner, 'api_endpoint', 'group');
    const requirementsExists = await checkColumnExists(queryRunner, 'api_endpoint', 'requirements');

    if (!groupExists) {
      console.log('Adding group column to api_endpoint table...');
      await queryRunner.query(`
        ALTER TABLE \`api_endpoint\`
        ADD COLUMN \`group\` varchar(255) NULL
      `);
    } else {
      console.log('Group column already exists, skipping...');
    }

    if (!requirementsExists) {
      console.log('Adding requirements column to api_endpoint table...');
      await queryRunner.query(`
        ALTER TABLE \`api_endpoint\`
        ADD COLUMN \`requirements\` text NULL
      `);
    } else {
      console.log('Requirements column already exists, skipping...');
    }

    console.log('Migrations completed successfully!');
    
    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

async function checkColumnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'testp' 
      AND TABLE_NAME = '${tableName}' 
      AND COLUMN_NAME = '${columnName}'
    `);
    return result[0].count > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

runMigrationsSafe();
