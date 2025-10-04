import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { MessageController } from './message.controller';

// Local interface for testing
interface SendMessageDto {
  receiverId: string;
  content: string;
}

describe('MessageController', () => {
  let controller: MessageController;
  let commandBus: CommandBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  describe('sendMessage', () => {
    const sendMessageDto: SendMessageDto = {
      receiverId: 'bob',
      content: 'Test message',
    };

    it('should send one-to-one message via API', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const result = await controller.sendMessage(sendMessageDto, 'alice');

      expect(result).toEqual({ message: 'Message sent successfully' });
      
      const executedCommand = mockCommandBus.execute.mock.calls[0][0];
      expect(executedCommand.senderId).toBe('alice');
      expect(executedCommand.payload).toEqual(sendMessageDto);
    });
  });
});