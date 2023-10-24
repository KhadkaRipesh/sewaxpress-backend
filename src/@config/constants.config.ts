import * as dotenv from 'dotenv';
dotenv.config();
export const DATABASE = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

export const JWT_SECRET = process.env.JWT_SECRET!;
