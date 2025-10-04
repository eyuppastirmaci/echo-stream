import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('One-to-One Chat Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Message Sending (POST /messages)', () => {
    it('should send message successfully with valid headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'alice')
        .send({
          receiverId: 'bob',
          content: 'Test message from Alice to Bob',
          messageType: 'text'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Message sent successfully');
    });

    it('should return 400 when X-User-Id header is missing', async () => {
      await request(app.getHttpServer())
        .post('/messages')
        .send({
          receiverId: 'bob',
          content: 'Test message without header',
          messageType: 'text'
        })
        .expect(400);
    });

    it('should send bidirectional messages', async () => {
      // Alice -> Bob
      await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'alice')
        .send({
          receiverId: 'bob',
          content: 'Hello Bob from Alice',
          messageType: 'text'
        })
        .expect(201);

      // Bob -> Alice
      await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'bob')
        .send({
          receiverId: 'alice',
          content: 'Hi Alice from Bob',
          messageType: 'text'
        })
        .expect(201);
    });
  });

  describe('Conversation Retrieval (GET /messages/conversation/:otherUserId)', () => {
    beforeAll(async () => {
      // Setup test data
      await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'testuser1')
        .send({
          receiverId: 'testuser2',
          content: 'First message',
          messageType: 'text'
        });

      await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'testuser2')
        .send({
          receiverId: 'testuser1',
          content: 'Reply message',
          messageType: 'text'
        });
    });

    it('should retrieve conversation history between two users', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages/conversation/testuser2')
        .query({ requesterId: 'testuser1' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if both messages are present
      const senderIds = response.body.map(msg => msg.senderId);
      expect(senderIds).toContain('testuser1');
      expect(senderIds).toContain('testuser2');
    });

    it('should return 400 when requesterId is missing', async () => {
      await request(app.getHttpServer())
        .get('/messages/conversation/testuser2')
        .expect(400);
    });

    it('should return empty array for non-existent conversation', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages/conversation/nonexistentuser')
        .query({ requesterId: 'testuser1' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return messages in correct order (newest first)', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages/conversation/testuser2')
        .query({ requesterId: 'testuser1' })
        .expect(200);

      if (response.body.length > 1) {
        const timestamps = response.body.map(msg => msg.timestamp);
        for (let i = 0; i < timestamps.length - 1; i++) {
          expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
        }
      }
    });
  });

  describe('Message Structure Validation', () => {
    it('should include all required message fields', async () => {
      await request(app.getHttpServer())
        .post('/messages')
        .set('X-User-Id', 'sender')
        .send({
          receiverId: 'receiver',
          content: 'Test message structure',
          messageType: 'text'
        });

      const response = await request(app.getHttpServer())
        .get('/messages/conversation/receiver')
        .query({ requesterId: 'sender' })
        .expect(200);

      if (response.body.length > 0) {
        const message = response.body[0];
        expect(message).toHaveProperty('_id');
        expect(message).toHaveProperty('senderId', 'sender');
        expect(message).toHaveProperty('receiverId', 'receiver');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('timestamp');
        expect(message).toHaveProperty('status', 'sent');
        expect(message).toHaveProperty('createdAt');
        expect(message).toHaveProperty('updatedAt');
      }
    });
  });
});