import { AllCourses } from './all-courses';
import { render } from '@wordpress/element';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-all-courses')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<AllCourses />, root);
		}
	});
});
