import redis from "../config/redis";

export async function cache<T>(
	key: string,
	callback: () => Promise<T> | T,
	ttl: number,
): Promise<T> {
	const value = await redis.get(key);

	if (value) return JSON.parse(value) as T;

	const result = await callback();

	await redis.set(key, JSON.stringify(result), "EX", ttl);

	return result;
}

export async function expireCache(key: string) {
	await redis.expire(key, 0);
}
