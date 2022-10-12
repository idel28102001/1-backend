import { CacheModule, Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import type { RedisClientOptions } from 'redis';
import { config } from '../common/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: () => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
