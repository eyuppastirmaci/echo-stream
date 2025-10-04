export class GetConversationQuery {
  constructor(
    public readonly requesterId: string,
    public readonly otherUserId: string,
    public readonly limit: number = 50,
  ) {}
}
