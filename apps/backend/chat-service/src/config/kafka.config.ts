export const KAFKA_CONFIG = {
  BROKERS: ['localhost:9092'],
  CLIENT_ID: 'chat',
  CONSUMER_GROUP_ID: 'chat-consumer',
  TOPICS: {
    ONE_TO_ONE_MESSAGES: 'chat.messages.one-to-one',
  },
};