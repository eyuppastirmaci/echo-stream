import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MessageStatus } from '@app/models';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: Date.now })
  timestamp: number;

  @Prop({ 
    type: String, 
    enum: Object.values(MessageStatus), 
    default: MessageStatus.SENT 
  })
  status: MessageStatus;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
