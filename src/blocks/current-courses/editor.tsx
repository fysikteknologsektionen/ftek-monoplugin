import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { CurrentCourses } from './current-courses';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<CurrentCourses />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data="{}">
		<CurrentCourses.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
