import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Kafka, Producer } from 'kafkajs';
import { UserEvent, KAFKA_TOPICS } from '@app/models/chat.events';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.kafka = new Kafka({
      clientId: 'user-service-producer',
      brokers: [`localhost:${this.configService.get('KAFKA_PORT', 9092)}`],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.info('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.info('Kafka producer disconnected');
  }

  async publishUserEvent(event: UserEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: KAFKA_TOPICS.USER_EVENTS,
        messages: [
          {
            key: event.userId,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              timestamp: event.timestamp.toISOString(),
            },
          },
        ],
      });

      this.logger.info(
        {
          eventType: event.eventType,
          userId: event.userId,
          topic: KAFKA_TOPICS.USER_EVENTS,
        },
        'User event published successfully',
      );
    } catch (error) {
      this.logger.error(
        {
          error: error.message,
          eventType: event.eventType,
          userId: event.userId,
        },
        'Failed to publish user event',
      );
      throw error;
    }
  }
}