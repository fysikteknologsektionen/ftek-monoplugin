import { render } from '@wordpress/element';
import { CourseOverview } from './course-overview';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-plugin-course-overview')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<CourseOverview />, root);
		}
	});
});
