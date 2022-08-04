import { render } from '@wordpress/element';
import { CurrentCourses } from './current-courses';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-current-courses')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<CurrentCourses />, root);
		}
	});
});
