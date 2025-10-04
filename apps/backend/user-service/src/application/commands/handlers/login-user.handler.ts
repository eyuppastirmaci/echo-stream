import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { LoginUserCommand } from '../login-user.command';
import { User } from '../../../users/user.schema';
import { EventPublisher } from '../../../events/event-publisher.service';
import { UserOnlineStatusChangedEvent } from '@app/models/chat.events';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: PinoLogger,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: LoginUserCommand): Promise<User> {
    const { email, password } = command;

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login time and online status
    user.isOnline = true;
    user.updatedAt = new Date();
    await user.save();

    this.logger.info({ 
      userId: user._id.toString(), 
      email: user.email 
    }, 'User logged in successfully');

    // Publish user online status changed event
    const onlineStatusEvent: UserOnlineStatusChangedEvent = {
      eventType: 'user.online-status-changed',
      timestamp: new Date(),
      userId: user._id.toString(),
      data: {
        userId: user._id.toString(),
        isOnline: true,
      },
    };

    try {
      await this.eventPublisher.publishUserEvent(onlineStatusEvent);
    } catch (error) {
      this.logger.error({ error: error.message, userId: user._id.toString() }, 'Failed to publish user online status event');
    }

    return user;
  }
}