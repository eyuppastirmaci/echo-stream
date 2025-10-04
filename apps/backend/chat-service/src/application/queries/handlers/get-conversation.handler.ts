import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationQuery } from '../get-conversation.query';
import { MessageService } from '../../../messages/message.service';
import { PinoLogger } from 'nestjs-pino';

@QueryHandler(GetConversationQuery)
export class GetConversationHandler implements IQueryHandler<GetConversationQuery> {
  constructor(
    private readonly messageService: MessageService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetConversationQuery) {
    const { requesterId, otherUserId, limit } = query;
    this.logger.debug({ requesterId, otherUserId, limit }, 'fetching conversation');
    return this.messageService.findConversation(requesterId, otherUserId, limit);
  }
}
