import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { APP_CONFIG, KAFKA_CONFIG } from './config';
import { Transport } from '@nestjs/microservices';
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

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: KAFKA_CONFIG.BROKERS,
      },
      consumer: {
        groupId: KAFKA_CONFIG.CONSUMER_GROUP_ID,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? APP_CONFIG.DEFAULT_PORT);
  logger.log(`Chat service is running on: ${await app.getUrl()}`);
}

bootstrap();
