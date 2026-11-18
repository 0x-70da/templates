import IORedis from "ioredis";

export function createRedisConnection(url: string) {
  return new IORedis(url, { maxRetriesPerRequest: null });
}
