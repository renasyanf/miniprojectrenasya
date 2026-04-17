import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop()
  deviceId: string;

  @Prop()
  deviceName: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
