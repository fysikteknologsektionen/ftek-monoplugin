import { IcsCalendar } from './ics-calendar';
import { render } from '@wordpress/element';
import { parse } from '../../utils/dataAttribute';

import metadata from './block.json';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-ics-calendar')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<IcsCalendar attributes={parse(data, metadata)} />, root);
		}
	});
});
