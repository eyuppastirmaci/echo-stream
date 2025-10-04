import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './messages/message.schema';
import { MessageService } from './messages/message.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SendMessageHandler } from './application/commands/handlers/send-message.handler';
import { GetConversationHandler } from './application/queries/handlers/get-conversation.handler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatGateway } from './chat/chat.gateway';
import { MessageController } from './messages/message.controller';
import { MessageQueryController } from './messages/message.query.controller';
import { MessageConsumer } from './messages/message.consumer';
import { KAFKA_CONFIG, LOGGING_CONFIG } from './config';
import { SERVICE_TOKENS } from './constants';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          LOGGING_CONFIG.NODE_ENV !== 'production'
            ? {
                target: LOGGING_CONFIG.PINO_PRETTY_TARGET,
                options: LOGGING_CONFIG.PINO_OPTIONS,
              }
            : undefined,
        level: LOGGING_CONFIG.LOG_LEVEL,
        redact: LOGGING_CONFIG.REDACT_FIELDS,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const port = configService.get('MONGO_PORT');
        const database = configService.get('MONGO_CHATSERVICE_DATABASE');
        
        return {
          uri: `mongodb://${username}:${password}@localhost:${port}/${database}?authSource=admin`,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    CqrsModule,
    ClientsModule.register([
      {
        name: SERVICE_TOKENS.KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: KAFKA_CONFIG.CLIENT_ID,
            brokers: KAFKA_CONFIG.BROKERS,
          },
          consumer: {
            groupId: KAFKA_CONFIG.CONSUMER_GROUP_ID,
          },
        },
      },
    ]),
  ],
  controllers: [MessageController, MessageQueryController, MessageConsumer],
  providers: [ChatGateway, MessageService, SendMessageHandler, GetConversationHandler],
})
export class AppModule {}
