import { useState, useEffect } from '@wordpress/element';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch'; // eslint-disable-line import/named
import { addQueryArgs } from '@wordpress/url';

const PAGE_SIZE = 100;

export default function useFetchAll<T>(
	options: Omit<APIFetchOptions, 'method' | 'parse'> &
		Required<Pick<APIFetchOptions, 'path'>>,
	deps?: React.DependencyList
): [T[], boolean] {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (data.length % PAGE_SIZE === 0) {
			apiFetch({
				...options,
				path: addQueryArgs(options.path, {
					per_page: PAGE_SIZE,
					offset: data.length,
				}),
			})
				.then((morePosts) => {
					if (Array.isArray(morePosts) && morePosts.length > 0) {
						setData([...data, ...morePosts]);
					} else {
						setLoading(false);
					}
				})
				.catch(console.error); // eslint-disable-line no-console
		} else {
			setLoading(false);
		}
	}, [data, deps]);

	return [data, loading];
}
