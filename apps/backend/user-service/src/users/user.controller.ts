import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PinoLogger } from 'nestjs-pino';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { LoginUserCommand } from '../application/commands/login-user.command';
import { GetUserByIdQuery, GetUserByEmailQuery, GetUserByUsernameQuery } from '../application/queries/get-user.query';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterUserDto) {
    this.logger.info({ email: registerDto.email, username: registerDto.username }, 'Registration attempt');
    
    const command = new RegisterUserCommand(
      registerDto.email,
      registerDto.username,
      registerDto.password,
      registerDto.passwordAgain,
    );
    
    const user: User = await this.commandBus.execute(command);
    const safeUser = this.userService.transformToSafeUser(user);

    return {
      message: 'User registered successfully. Please check your email for verification.',
      user: safeUser,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    this.logger.info({ email: loginDto.email }, 'Login attempt');
    
    const command = new LoginUserCommand(loginDto.email, loginDto.password);
    const user: User = await this.commandBus.execute(command);
    const safeUser = this.userService.transformToSafeUser(user);

    return {
      message: 'Login successful',
      user: safeUser,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const query = new GetUserByIdQuery(id);
    const user: User | null = await this.queryBus.execute(query);
    
    if (!user) {
      return { message: 'User not found' };
    }

    return {
      user: this.userService.transformToSafeUser(user),
    };
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const query = new GetUserByEmailQuery(email);
    const user: User | null = await this.queryBus.execute(query);
    
    if (!user) {
      return { message: 'User not found' };
    }

    return {
      user: this.userService.transformToSafeUser(user),
    };
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    const query = new GetUserByUsernameQuery(username);
    const user: User | null = await this.queryBus.execute(query);
    
    if (!user) {
      return { message: 'User not found' };
    }

    return {
      user: this.userService.transformToSafeUser(user),
    };
  }
}