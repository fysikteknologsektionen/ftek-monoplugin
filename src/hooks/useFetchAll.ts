import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch'; // eslint-disable-line import/named
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

const PAGE_SIZE = 100;

const useFetchAll = <T>(
	options: Omit<APIFetchOptions, 'method' | 'parse'> &
		Required<Pick<APIFetchOptions, 'path'>>,
	deps?: React.DependencyList
): [T[], boolean] => {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (data.length % PAGE_SIZE === 0) {
			apiFetch<T[]>({
				...options,
				path: addQueryArgs(options.path, {
					per_page: PAGE_SIZE,
					offset: data.length,
				}),
			})
				.then((moreData) => {
					if (Array.isArray(moreData) && moreData.length > 0) {
						setData([...data, ...moreData]);
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
};

export default useFetchAll;
