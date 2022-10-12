import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';
import { config } from '../../common/config';
import { AuthUser } from '../../users/interfaces/auth.user.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateJwt(user: AuthUser, req) {
    const jwtRefreshExpires = config.getJwtRefreshExpires();

    const accessToken = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
    });

    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
        phone: user.phone,
        hash: req.fingerprint.hash,
      },
      {
        expiresIn: jwtRefreshExpires,
      },
    );

    await this.redisService.set(
      `${user.id}_${req.fingerprint.hash}`,
      refreshToken,
      jwtRefreshExpires,
    );

    return { accessToken, refreshToken };
  }

  decodeRefresh(refreshToken: string): { id: string; phone: string } {
    return this.jwtService.decode(refreshToken) as {
      id: string;
      phone: string;
    };
  }

  async deleteByUserId(id: string, req): Promise<void> {
    await this.redisService.del(`${id}_${req.fingerprint.hash}`);
  }

  async deleteAllByUserId(id: string): Promise<void> {
    await this.redisService.removeByPattern(`${id}_*`);
  }
}
