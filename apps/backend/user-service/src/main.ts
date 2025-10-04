import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

const envPath = resolve(process.cwd(), '../../..', '.env');

const exists = fs.existsSync(envPath);
if (exists) {
  dotenv.config({ path: envPath });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: '*', // Configure for production
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.USER_SERVICE_PORT || 3002;
  await app.listen(port);
  logger.log(`User service is running on port: ${port}`);
}

bootstrap();