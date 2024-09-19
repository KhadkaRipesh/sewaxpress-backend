import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { seedData } from './seed-data';
import { DbModule } from './db.module';

async function runSeeder() {
  const app = await NestFactory.create(DbModule);
  const dataSource = app.get(DataSource);
  await seedData(dataSource);
  await app.close();
}
runSeeder();
