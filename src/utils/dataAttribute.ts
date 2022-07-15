import { BlockJson } from './types';

export const serialize = <T extends {}>(t: T): string =>
	JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k, v]) => v)));

export const parse = <T extends {}>(
	data: string | undefined,
	metadata: BlockJson<T>
): T => {
	const raw = data ? JSON.parse(data) : {};
	return Object.fromEntries(
		Object.entries(metadata.attributes).map(
			([k, v]: [string, { default?: any }]) => [k, raw?.[k] || v?.default]
		)
	) as T;
};
