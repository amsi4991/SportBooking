
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    let publicKey: string;
    
    try {
      const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
      console.log(`[JwtStrategy] Loading public key from: ${publicKeyPath}`);
      publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log(`[JwtStrategy] ✅ Public key loaded (${publicKey.length} bytes)`);
    } catch (error) {
      console.error(`[JwtStrategy] ❌ Failed to load public key:`, error);
      throw error;
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256']
    });
  }

  async validate(payload: any) {
    return { id: payload.sub };
  }
}
