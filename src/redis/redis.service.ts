import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly $cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T> {
    return await this.$cacheManager.get<T>(key);
  }

  async getByPattern<T>(pattern: string): Promise<T> {
    return await this.$cacheManager.store.keys<T>(pattern);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    return await this.$cacheManager.set<T>(key, value, { ttl });
  }

  async del(key: string): Promise<void> {
    return this.$cacheManager.del(key);
  }

  async reset(): Promise<void> {
    return this.$cacheManager.reset();
  }

  async removeByPattern(pattern: string): Promise<void> {
    const keys = await this.getByPattern<string[]>(pattern);

    await Promise.all(
      keys.map(async (key) => {
        await this.del(key);
      }),
    );
  }
}
