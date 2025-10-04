import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { EventPublisher } from '../events/event-publisher.service';
import { UserCreatedEvent, UserOnlineStatusChangedEvent } from '@app/models/chat.events';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: PinoLogger,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<User> {
    const { email, username, password, passwordAgain } = registerDto;

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
      // Don't throw error, user is already saved, event publishing failure shouldn't affect registration
    }

    return savedUser;
  }

  async login(loginDto: LoginUserDto): Promise<User> {
    const { email, password } = loginDto;

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

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async updateVerificationStatus(userId: string, isVerified: boolean): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId, 
      { isVerified, updatedAt: new Date() }, 
      { new: true }
    ).exec();
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId, 
      { isOnline, updatedAt: new Date() }, 
      { new: true }
    ).exec();
  }

  // Helper method to transform user to safe response
  transformToSafeUser(user: User): any {
    const { password, ...safeUser } = user.toObject();
    return {
      ...safeUser,
      id: safeUser._id.toString(),
    };
  }
}