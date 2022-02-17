import { render } from '@wordpress/element';

import MyComponent from '../components/my-component';

document.addEventListener('DOMContentLoaded', () => {
	const root = document.createElement('div');
	document.body.prepend(root);
	render(<MyComponent />, root);
});
