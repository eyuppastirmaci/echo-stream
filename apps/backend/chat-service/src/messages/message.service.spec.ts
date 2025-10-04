import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './message.schema';

// Local enum for testing
enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

describe('MessageService', () => {
  let service: MessageService;
  let messageModel: any;

  const mockMessage = {
    _id: 'test-id',
    senderId: 'alice',
    receiverId: 'bob',
    content: 'Test message',
    timestamp: Date.now(),
    status: MessageStatus.SENT,
    save: jest.fn(),
  };

  const mockMessageModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ ...data, _id: 'test-id' }),
  }));

  // Add static methods to the mock constructor
  mockMessageModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockMessage]),
      }),
    }),
  });
  
  mockMessageModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockMessage),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageModel = module.get(getModelToken(Message.name));
  });

  describe('createMessage', () => {
    it('should create and send one-to-one message successfully', async () => {
      mockMessage.save.mockResolvedValue(mockMessage);
      messageModel.mockImplementation(() => mockMessage);

      const result = await service.createMessage(
        'alice',
        'bob', 
        'Hello Bob!',
      );

      expect(result).toEqual(mockMessage);
      expect(messageModel).toHaveBeenCalledWith({
        senderId: 'alice',
        receiverId: 'bob',
        content: 'Hello Bob!',
        timestamp: expect.any(Number),
        status: MessageStatus.SENT,
      });
    });
  });

  describe('findConversation', () => {
    it('should retrieve one-to-one conversation history', async () => {
      const mockConversation = [
        { senderId: 'alice', receiverId: 'bob', content: 'Hello Bob!' },
        { senderId: 'bob', receiverId: 'alice', content: 'Hi Alice!' },
      ];
      
      const mockChain = {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockConversation),
          }),
        }),
      };
      mockMessageModel.find.mockReturnValue(mockChain);

      const result = await service.findConversation('alice', 'bob', 50);

      expect(mockMessageModel.find).toHaveBeenCalledWith({
        $or: [
          { senderId: 'alice', receiverId: 'bob' },
          { senderId: 'bob', receiverId: 'alice' },
        ],
      });
      expect(result).toEqual(mockConversation);
    });
  });


});
