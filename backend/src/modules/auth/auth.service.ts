
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService
  ) {}

  async hash(password: string) {
    return argon2.hash(password);
  }

  async generateTokens(userId: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomUUID();
    const hash = await argon2.hash(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 7 * 86400000)
      }
    });

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, token: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false }
    });

    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, token)) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revoked: true }
        });
        return this.generateTokens(userId);
      }
    }

    throw new UnauthorizedException();
  }
}
