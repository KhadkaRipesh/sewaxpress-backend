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

export const BASE_URL = {
  frontend: process.env.FRONTEND_URL,
  backend: process.env.BACKEND_URL,
};

export const FIREBASE_SERVICE_ACCOUNT: {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
} = {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE!,
  project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID!,
  private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!,
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL!,
};
