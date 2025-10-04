import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * ChatUser schema
 * This is synchronized from User Service via Kafka events
 */
@Schema({ timestamps: true })
export class ChatUser extends Document {
  @Prop({ required: true, unique: true })
  userId: string; // Reference to the user in User Service

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  lastSeenAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ChatUserSchema = SchemaFactory.createForClass(ChatUser);

// Create indexes for better performance
ChatUserSchema.index({ userId: 1 });
ChatUserSchema.index({ username: 1 });
ChatUserSchema.index({ isOnline: 1 });
ChatUserSchema.index({ isVerified: 1 });