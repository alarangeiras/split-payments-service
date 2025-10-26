// import { ensureArray } from "./array";

// export function deepMock<T>(
// 	_constructor?: new (...args: any) => T,
// 	// biome-ignore lint/complexity/noBannedTypes: should dynamically retrieve the methods
// 	..._functions: Function[]
// ) {
// 	const object = {} as any;
// 	if (_constructor) {
// 		for (const property of Object.getOwnPropertyNames(_constructor.prototype)) {
// 			object[property] = jest.fn();
// 		}
// 	}
// 	for (const func of ensureArray(_functions)) {
// 		object[func.name] = jest.fn();
// 	}
// 	return object as jest.MockedObjectDeep<T>;
// }
export * as mockito from "ts-mockito";
