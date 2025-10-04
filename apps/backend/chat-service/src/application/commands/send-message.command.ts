import { SendMessageDto } from '@app/models';

export class SendMessageCommand {
  constructor(
    public readonly senderId: string,
    public readonly payload: SendMessageDto,
  ) {}
}
