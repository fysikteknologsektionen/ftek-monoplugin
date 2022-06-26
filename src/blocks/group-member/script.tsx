import { GroupMember } from './group-member';
import { render } from '@wordpress/element';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-group-member')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			const attributes = JSON.parse(data);
			render(<GroupMember attributes={attributes} />, root);
		}
	});
});
