import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { UserEvent } from '@app/models/chat.events';
import { ChatUser } from './chat-user.schema';

@Injectable()
export class UserEventConsumer {
  constructor(
    @InjectModel(ChatUser.name) private readonly chatUserModel: Model<ChatUser>,
    private readonly logger: PinoLogger,
  ) {}

  async handleUserEvent(event: UserEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'user.created':
          await this.handleUserCreated(event);
          break;
        case 'user.updated':
          await this.handleUserUpdated(event);
          break;
        case 'user.verified':
          await this.handleUserVerified(event);
          break;
        case 'user.online-status-changed':
          await this.handleOnlineStatusChanged(event);
          break;
        default:
          this.logger.warn({ eventType: (event as any).eventType }, 'Unhandled user event type');
      }
    } catch (error) {
      this.logger.error(
        { 
          error: error.message, 
          eventType: event.eventType, 
          userId: event.userId 
        },
        'Failed to handle user event',
      );
      throw error;
    }
  }

  private async handleUserCreated(event: UserEvent): Promise<void> {
    if (event.eventType !== 'user.created') return;

    const existingUser = await this.chatUserModel.findOne({ userId: event.userId }).exec();
    if (existingUser) {
      this.logger.info({ userId: event.userId }, 'User already exists in chat service');
      return;
    }

    const chatUser = new this.chatUserModel({
      userId: event.userId,
      username: event.data.username,
      email: event.data.email,
      isVerified: event.data.isVerified,
      isOnline: false,
      createdAt: event.data.createdAt,
      updatedAt: new Date(),
    });

    await chatUser.save();
    
    this.logger.info(
      { userId: event.userId, username: event.data.username },
      'User created in chat service',
    );
  }

  private async handleUserUpdated(event: UserEvent): Promise<void> {
    if (event.eventType !== 'user.updated') return;

    const updateData: any = { 
      updatedAt: event.data.updatedAt 
    };

    if (event.data.username !== undefined) {
      updateData.username = event.data.username;
    }
    if (event.data.email !== undefined) {
      updateData.email = event.data.email;
    }
    if (event.data.isVerified !== undefined) {
      updateData.isVerified = event.data.isVerified;
    }
    if (event.data.isOnline !== undefined) {
      updateData.isOnline = event.data.isOnline;
    }

    await this.chatUserModel.findOneAndUpdate(
      { userId: event.userId },
      updateData,
      { new: true }
    ).exec();

    this.logger.info({ userId: event.userId }, 'User updated in chat service');
  }

  private async handleUserVerified(event: UserEvent): Promise<void> {
    if (event.eventType !== 'user.verified') return;

    await this.chatUserModel.findOneAndUpdate(
      { userId: event.userId },
      { 
        isVerified: true, 
        updatedAt: new Date() 
      },
      { new: true }
    ).exec();

    this.logger.info({ userId: event.userId }, 'User verified in chat service');
  }

  private async handleOnlineStatusChanged(event: UserEvent): Promise<void> {
    if (event.eventType !== 'user.online-status-changed') return;

    const updateData: any = {
      isOnline: event.data.isOnline,
      updatedAt: new Date(),
    };

    if (event.data.lastSeenAt) {
      updateData.lastSeenAt = event.data.lastSeenAt;
    }

    await this.chatUserModel.findOneAndUpdate(
      { userId: event.userId },
      updateData,
      { new: true }
    ).exec();

    this.logger.info(
      { userId: event.userId, isOnline: event.data.isOnline },
      'User online status updated in chat service',
    );
  }
}