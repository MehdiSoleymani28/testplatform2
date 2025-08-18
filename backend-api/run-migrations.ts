import { AppDataSource } from './src/database/data-source';

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    
    console.log('Migrations completed successfully!');
    
    // Close the connection
    await AppDataSource.destroy();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
