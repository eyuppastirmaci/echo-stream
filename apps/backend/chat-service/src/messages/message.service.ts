import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { MessageStatus } from '@app/models';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    const message = new this.messageModel({
      senderId,
      receiverId,
      content,
      timestamp: Date.now(),
      status: MessageStatus.SENT,
    });
    return message.save();
  }

  async findConversation(
    requesterId: string,
    otherUserId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    const query = {
      $or: [
        { senderId: requesterId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: requesterId },
      ],
    };
    const result = await this.messageModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
    return result;
  }

  async updateMessageStatus(
    messageId: string,
    status: MessageStatus,
  ): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(messageId, { status }, { new: true })
      .exec();
  }
}
