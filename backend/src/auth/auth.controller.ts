import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    sessionId: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      statusCode: HttpStatus.CREATED,
      data: user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const meta = {
      ip: (req.ip as string) ?? undefined,
      userAgent: req.headers['user-agent'] as string | undefined,
    };
    const result = await this.authService.login(dto, meta);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: RequestWithUser) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async sessions(@Req() req: RequestWithUser) {
    const sessions = await this.authService.getSessionsForUser(
      req.user.userId,
    );
    return {
      statusCode: HttpStatus.OK,
      data: sessions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.authService.revokeSession(req.user.userId, id);
  }
}

