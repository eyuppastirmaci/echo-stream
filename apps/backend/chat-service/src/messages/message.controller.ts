import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageCommand } from '../application/commands/send-message.command';
import { SendMessageDto } from '@app/models';

@Controller('messages')
export class MessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Headers('x-user-id') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('X-User-Id header is required');
    }
    
    await this.commandBus.execute(
      new SendMessageCommand(userId, sendMessageDto),
    );
    
    return { message: 'Message sent successfully' };
  }
}
