import { Controller, Get, Query, Param, BadRequestException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetConversationQuery } from '../application/queries/get-conversation.query';

@Controller('messages')
export class MessageQueryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('conversation/:otherUserId')
  async getConversation(
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: string,
    @Query('requesterId') requesterId?: string,
  ) {
    if (!requesterId) {
      throw new BadRequestException('requesterId query parameter is required');
    }
    
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    
    return this.queryBus.execute(
      new GetConversationQuery(requesterId, otherUserId, parsedLimit),
    );
  }
}
