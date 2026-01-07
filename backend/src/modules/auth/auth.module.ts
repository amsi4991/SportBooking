import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import * as fs from 'fs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => {
        const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
        const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';

        console.log(`[JWT] Reading keys from: ${privateKeyPath}, ${publicKeyPath}`);

        try {
          const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
          const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
          console.log(`[JWT] ✅ Keys loaded successfully (priv: ${privateKey.length} bytes, pub: ${publicKey.length} bytes)`);

          return {
            privateKey,
            publicKey,
            signOptions: { expiresIn: '15m', algorithm: 'RS256' as const }
          };
        } catch (error) {
          console.error(`[JWT] ❌ FAILED to load keys:`, error);
          throw error;
        }
      }
    })
  ],
  providers: [JwtStrategy, AuthService, PrismaService],
  controllers: [AuthController],
  exports: [JwtModule, AuthService]
})
export class AuthModule {}
