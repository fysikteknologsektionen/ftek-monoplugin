import { render } from '@wordpress/element';
import { parse } from '../../utils/dataAttribute';
import { DriveList } from './drive-list';

import metadata from './block.json';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-drive-list')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<DriveList attributes={parse(data, metadata)} />, root);
		}
	});
});
