import { render } from '@wordpress/element';
import { parse } from '../../utils/dataAttribute';
import { AsideDynamicArea, MainDynamicArea } from './group-page';

import metadata from './block.json';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-group-page')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			const aside = root
				.getElementsByClassName('aside-dynamic-area')
				.item(0);
			if (aside) {
				render(
					<AsideDynamicArea attributes={parse(data, metadata)} />,
					aside
				);

				const main = root
					.getElementsByClassName('main-dynamic-area')
					.item(0);
				if (main) {
					render(<MainDynamicArea asideElement={aside} />, main);
				}
			}
		}
	});
});
