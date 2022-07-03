import { AsideDynamicArea } from './group-page';
import { render } from '@wordpress/element';
import { GroupPageMeta } from '../../utils/types';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-group-page')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			const meta: GroupPageMeta = JSON.parse(data);
			Array.from(
				root.getElementsByClassName('aside-dynamic-area')
			).forEach((area) =>
				render(<AsideDynamicArea attributes={meta} />, area)
			);
		}
	});
});
