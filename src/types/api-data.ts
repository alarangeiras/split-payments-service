import type { MaybeArray } from "../utils/array";

export type ApiValue = string | number | boolean;
export type ApiData = MaybeArray<{
	[key: string]: ApiValue | Array<ApiValue> | ApiData;
}>;
