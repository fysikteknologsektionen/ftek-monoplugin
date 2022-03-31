import { __ } from '@wordpress/i18n';

import styles from './index.module.scss';

export default function MyComponent(): JSX.Element {
	return (
		<div className={styles['my-class']}>
			{__('Hello from MyComponent!', 'template-wp-plugin')}
		</div>
	);
}
