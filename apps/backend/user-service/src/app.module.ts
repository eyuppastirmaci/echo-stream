import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { CqrsModule } from '@nestjs/cqrs';
import { join } from 'path';
import { User, UserSchema } from './users/user.schema';
import { UserService } from './users/user.service';
import { UserController } from './users/user.controller';
import { EventPublisher } from './events/event-publisher.service';
import { RegisterUserHandler } from './application/commands/handlers/register-user.handler';
import { LoginUserHandler } from './application/commands/handlers/login-user.handler';
import { GetUserByIdHandler, GetUserByEmailHandler, GetUserByUsernameHandler } from './application/queries/handlers/get-user.handler';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '../../..', '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const port = configService.get('MONGO_PORT');
        const database = configService.get('MONGO_USERSERVICE_DATABASE') || 'userservice';
        
        return {
          uri: `mongodb://${username}:${password}@localhost:${port}/${database}?authSource=admin`,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [UserController],
  providers: [
    UserService, 
    EventPublisher,
    // Command Handlers
    RegisterUserHandler,
    LoginUserHandler,
    // Query Handlers
    GetUserByIdHandler,
    GetUserByEmailHandler,
    GetUserByUsernameHandler,
  ],
  exports: [UserService, EventPublisher],
})
export class AppModule {}