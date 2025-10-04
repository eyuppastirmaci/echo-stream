import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
