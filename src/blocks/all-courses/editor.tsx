import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { AllCourses } from './all-courses';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<AllCourses />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data="{}">
		<AllCourses.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
