import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { MessageQueryController } from './message.query.controller';

describe('MessageQueryController', () => {
  let controller: MessageQueryController;
  let queryBus: QueryBus;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageQueryController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<MessageQueryController>(MessageQueryController);
    queryBus = module.get<QueryBus>(QueryBus);
    
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  describe('getConversation', () => {
    const mockMessages = [
      {
        _id: 'msg1',
        senderId: 'alice',
        receiverId: 'bob',
        content: 'Hello Bob',
        timestamp: 1234567890,
        status: 'sent',
      },
      {
        _id: 'msg2',
        senderId: 'bob',
        receiverId: 'alice',
        content: 'Hi Alice',
        timestamp: 1234567891,
        status: 'sent',
      },
    ];

    it('should get conversation successfully with valid requesterId', async () => {
      mockQueryBus.execute.mockResolvedValue(mockMessages);

      const result = await controller.getConversation('bob', undefined, 'alice');

      expect(queryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockMessages);
    });

    it('should retrieve one-to-one conversation via API', async () => {
      mockQueryBus.execute.mockResolvedValue(mockMessages);

      const result = await controller.getConversation('bob', '10', 'alice');

      expect(result).toEqual(mockMessages);
      
      const executedQuery = mockQueryBus.execute.mock.calls[0][0];
      expect(executedQuery.requesterId).toBe('alice');
      expect(executedQuery.otherUserId).toBe('bob');
      expect(executedQuery.limit).toBe(10);
    });
  });
});