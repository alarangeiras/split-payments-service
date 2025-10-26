export type MaybeArray<T> = T | Array<T>;

export function ensureArray<T>(value?: MaybeArray<T>): T[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}
