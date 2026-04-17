import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.schema';
import { Session } from '../sessions/session.schema';

interface JwtPayload {
  sub: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
    });

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const deviceId = dto.deviceId ?? new Types.ObjectId().toString();

    const session = await this.sessionModel.create({
      userId: user._id,
      deviceId,
      deviceName: dto.deviceName ?? 'Unknown Device',
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      isActive: true,
      lastUsedAt: new Date(),
    });

    const payload: JwtPayload = {
      sub: user._id.toString(),
      sessionId: session._id.toString(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      sessionId: session._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
      },
      deviceId,
    };
  }

  async validateToken(payload: JwtPayload) {
    const session = await this.sessionModel.findById(payload.sessionId);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is not active');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $set: { lastUsedAt: new Date() } },
    );

    return { user, session };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async getSessionsForUser(userId: string) {
    const sessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ lastUsedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s._id.toString(),
      deviceId: s.deviceId,
      deviceName: s.deviceName,
      isActive: s.isActive,
      lastUsedAt: s.lastUsedAt,
      createdAt: (s as any).createdAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
    });

    if (!session) {
      return;
    }

    session.isActive = false;
    await session.save();
  }
}

