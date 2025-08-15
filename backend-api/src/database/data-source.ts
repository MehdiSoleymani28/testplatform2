import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'testp',
  password: '!@34QWer',
  database: 'testp',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});
