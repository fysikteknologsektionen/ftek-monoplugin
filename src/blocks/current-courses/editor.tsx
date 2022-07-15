import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { CurrentCourses } from './current-courses';

import { serialize } from '../../utils/dataAttribute';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<CurrentCourses />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize({})}>
		<CurrentCourses.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
