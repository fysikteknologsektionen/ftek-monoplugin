import { render } from '@wordpress/element';
import { parse } from '../../utils/dataAttribute';
import { GroupMember } from './group-member';

import metadata from './block.json';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-group-member')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<GroupMember attributes={parse(data, metadata)} />, root);
		}
	});
});
