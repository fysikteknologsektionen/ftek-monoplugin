import { AsideDynamicArea } from './group-page';
import { render } from '@wordpress/element';
import { parse } from '../../utils/dataAttribute';

import metadata from './block.json';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-group-page')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			Array.from(
				root.getElementsByClassName('aside-dynamic-area')
			).forEach((area) =>
				render(
					<AsideDynamicArea attributes={parse(data, metadata)} />,
					area
				)
			);
		}
	});
});
