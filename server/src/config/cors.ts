import cors from 'cors';
import { getEnv } from './environment';

export function createCorsOptions(): cors.CorsOptions {
  const { CLIENT_URL } = getEnv();

  return {
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };
}
