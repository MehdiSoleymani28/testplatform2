import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'sinai.liara.cloud',
  port: 33839,
  username: 'root',
  password: 'fLhMhBqJy5pHotYUmqKKH5bQ',
  database: 'flamboyant_jackson',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
