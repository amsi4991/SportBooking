import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new UnauthorizedException();

    // support seed hashed passwords (sha256) or argon2
    const provided = body.password;
    const sha = crypto.createHash('sha256').update(provided).digest('hex');

    let valid = false;
    if (user.password === sha) {
      valid = true;
    } else {
      try {
        valid = await argon2.verify(user.password, provided);
      } catch (e) {
        valid = false;
      }
    }

    if (!valid) throw new UnauthorizedException();

    const tokens = await this.auth.generateTokens(user.id);
    return tokens;
  }
}
