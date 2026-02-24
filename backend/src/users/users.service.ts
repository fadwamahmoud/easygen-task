import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  create(data: { email: string; name: string; passwordHash: string }) {
    return this.userModel.create({
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash,
    });
  }
}