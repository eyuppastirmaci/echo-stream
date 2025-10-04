import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatGateway } from '../chat/chat.gateway';
import { NewMessageEvent } from '@app/models';
import { PinoLogger } from 'nestjs-pino';

@Controller()
export class MessageConsumer {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly logger: PinoLogger,
  ) {}

  @MessagePattern('chat.messages.one-to-one')
  async handleNewMessage(@Payload() message: NewMessageEvent) {
    this.logger.debug({ messageId: message.id }, 'received message from kafka');
    
    // Emit to all connected clients who are involved in this conversation
    this.chatGateway.server.emit('newMessage', message);
    
    this.logger.debug({ 
      messageId: message.id, 
      senderId: message.senderId, 
      receiverId: message.receiverId 
    }, 'message broadcasted to websocket clients');
  }
}