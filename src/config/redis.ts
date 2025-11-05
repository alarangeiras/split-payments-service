import Redis from 'ioredis';
import config from './config';
import { RedisConfig } from './types';

const redisConfig = config.get<RedisConfig>('redis');

const redis = new Redis(redisConfig.uri);

export default redis;
