import { DriveList, attrsOrDefault } from './drive-list';
import { render } from '@wordpress/element';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-drive-list')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			const attributes = attrsOrDefault(JSON.parse(data));
			render(<DriveList attributes={attributes} />, root);
		}
	});
});
