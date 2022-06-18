import { CourseOverview } from './course-overview';
import { render } from '@wordpress/element';

document.addEventListener('DOMContentLoaded', () => {
	Array.from(
		document.getElementsByClassName('wp-block-ftek-course-overview')
	).forEach((root) => {
		const data: string | undefined =
			root.attributes.getNamedItem('data')?.value;
		if (data) {
			render(<CourseOverview />, root);
		}
	});
});
