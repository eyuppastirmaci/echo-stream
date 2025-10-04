import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageCommand } from '../send-message.command';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { KAFKA_CONFIG } from '../../../config';
import { SERVICE_TOKENS } from '../../../constants';
import { PinoLogger } from 'nestjs-pino';
import { MessageService } from '../../../messages/message.service';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    @Inject(SERVICE_TOKENS.KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly messageService: MessageService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: SendMessageCommand): Promise<void> {
    const { senderId, payload } = command;
    
    // Save message to MongoDB
    const savedMessage = await this.messageService.createMessage(
      senderId,
      payload.receiverId,
      payload.content,
    );
    
    // Publish event to Kafka
    this.kafkaClient.emit(KAFKA_CONFIG.TOPICS.ONE_TO_ONE_MESSAGES, {
      id: savedMessage._id.toString(),
      senderId,
      receiverId: payload.receiverId,
      content: payload.content,
      timestamp: savedMessage.timestamp,
      status: savedMessage.status,
    });
    
    this.logger.debug({ 
      messageId: savedMessage._id.toString(),
      senderId, 
      receiverId: payload.receiverId 
    }, 'message saved and published to kafka');
  }
}
