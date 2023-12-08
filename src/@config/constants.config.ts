import * as dotenv from 'dotenv';
dotenv.config();
export const DATABASE = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

export const PORT: number = parseInt(process.env.PORT!);

export const JWT_SECRET = process.env.JWT_SECRET!;

export const SMTP_INFO = {
  user: process.env.SMTP_USER!,
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  password: process.env.SMTP_PASSWORD!,
};
