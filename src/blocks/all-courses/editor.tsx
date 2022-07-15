import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { AllCourses } from './all-courses';

import { serialize } from '../../utils/dataAttribute';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<AllCourses />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize({})}>
		<AllCourses.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
