import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { RegisterUserCommand } from '../register-user.command';
import { User } from '../../../users/user.schema';
import { EventPublisher } from '../../../events/event-publisher.service';
import { UserCreatedEvent } from '@app/models/chat.events';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: PinoLogger,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const { email, username, password, passwordAgain } = command;

    // Check if passwords match
    if (password !== passwordAgain) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user with email already exists
    const existingUserByEmail = await this.userModel.findOne({ email }).exec();
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if user with username already exists
    const existingUserByUsername = await this.userModel.findOne({ username }).exec();
    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new this.userModel({
      email,
      username,
      password: hashedPassword,
      isVerified: false, // Will be verified via email
      isOnline: false,
    });

    const savedUser = await user.save();
    
    this.logger.info({ 
      userId: savedUser._id.toString(), 
      email: savedUser.email,
      username: savedUser.username 
    }, 'User registered successfully');

    // Publish user created event
    const userCreatedEvent: UserCreatedEvent = {
      eventType: 'user.created',
      timestamp: new Date(),
      userId: savedUser._id.toString(),
      data: {
        userId: savedUser._id.toString(),
        email: savedUser.email,
        username: savedUser.username,
        isVerified: savedUser.isVerified,
        createdAt: savedUser.createdAt,
      },
    };

    try {
      await this.eventPublisher.publishUserEvent(userCreatedEvent);
    } catch (error) {
      this.logger.error({ error: error.message, userId: savedUser._id.toString() }, 'Failed to publish user created event');
      // Don't throw error - user is already saved, event publishing failure shouldn't affect registration
    }

    return savedUser;
  }
}