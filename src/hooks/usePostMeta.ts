import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

const usePostMeta = <T, WPT>(
	metaKey: WPT extends { [K in infer R]: T } ? R : never,
	postType: string
): false | [T, (m: Partial<T>) => void] => {
	const currentPostType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);
	const [wpMeta, setWpMeta]: [WPT, (m: WPT) => void] = useEntityProp(
		'postType',
		currentPostType,
		'meta'
	);

	if (currentPostType !== postType) {
		return false;
	}

	// TODO: Better typing
	const meta = wpMeta[metaKey as any] as T;
	const updateMeta = (m: Partial<T>) =>
		setWpMeta({ [metaKey]: { ...meta, ...m } } as any as WPT);

	return [meta, updateMeta];
};

export default usePostMeta;
