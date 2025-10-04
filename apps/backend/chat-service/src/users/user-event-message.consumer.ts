import { Injectable } from '@nestjs/common';
import { EventPattern, Payload, KafkaContext, Ctx } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { UserEvent, KAFKA_TOPICS } from '@app/models/chat.events';
import { UserEventConsumer } from './user-event.consumer';

@Injectable()
export class UserEventMessageConsumer {
  constructor(
    private readonly userEventConsumer: UserEventConsumer,
    private readonly logger: PinoLogger,
  ) {}

  @EventPattern(KAFKA_TOPICS.USER_EVENTS)
  async handleUserEvent(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const { key, value, headers } = context.getMessage();
    
    this.logger.info(
      { 
        topic: context.getTopic(),
        partition: context.getPartition(),
        offset: context.getMessage().offset,
        key: key?.toString(),
        eventType: headers?.eventType?.toString(),
      },
      'Received user event from Kafka',
    );

    try {
      const event: UserEvent = JSON.parse(value.toString());
      await this.userEventConsumer.handleUserEvent(event);
      
      this.logger.info(
        { 
          eventType: event.eventType, 
          userId: event.userId,
          offset: context.getMessage().offset,
        },
        'Successfully processed user event',
      );
    } catch (error) {
      this.logger.error(
        { 
          error: error.message,
          key: key?.toString(),
          eventType: headers?.eventType?.toString(),
          offset: context.getMessage().offset,
        },
        'Failed to process user event',
      );
      throw error; // Rethrow to trigger Kafka retry mechanism
    }
  }
}