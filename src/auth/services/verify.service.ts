import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class VerifyService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  verifyAccess(accessToken: string) {
    return this.jwtService.verify(accessToken);
  }

  async verifyRefresh(refreshPayload, refreshToken: string): Promise<boolean> {
    const { hash, id, exp, phone } = refreshPayload;
    const key = `${id}_${hash}`;
    const storedToken = await this.redisService.get<string>(key);
    await this.redisService.del(key);
    return (
      phone &&
      !(
        new Date().getTime() / 1000 >= exp ||
        !storedToken ||
        storedToken !== refreshToken
      )
    );
  }
}
