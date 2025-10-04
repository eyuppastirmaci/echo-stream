import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUserByIdQuery, GetUserByEmailQuery, GetUserByUsernameQuery } from '../get-user.query';
import { User } from '../../../users/user.schema';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.userModel.findById(query.id).exec();
  }
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userModel.findOne({ email: query.email }).exec();
  }
}

@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler implements IQueryHandler<GetUserByUsernameQuery> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(query: GetUserByUsernameQuery): Promise<User | null> {
    return this.userModel.findOne({ username: query.username }).exec();
  }
}