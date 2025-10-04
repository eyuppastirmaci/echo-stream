import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageCommand } from '../application/commands/send-message.command';
import { SendMessageDto } from '@app/models';
import { PinoLogger } from 'nestjs-pino';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: PinoLogger,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Use senderId from the message data if provided, otherwise fallback to client data
    const senderId = data.senderId || client.data.userId;
    
    if (!senderId) {
      this.logger.error('senderId is required but not provided');
      return { error: 'senderId is required' };
    }
    
    this.logger.debug({ senderId, receiverId: data.receiverId }, 'handling send message');
    
    await this.commandBus.execute(
      new SendMessageCommand(senderId, data),
    );
  }

  handleConnection(client: Socket) {
    this.logger.debug({ clientId: client.id }, 'client connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug({ clientId: client.id }, 'client disconnected');
  }
}
