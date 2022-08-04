import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { CourseOverview } from './course-overview';

import { serialize } from '../../utils/dataAttribute';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<CourseOverview />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize({})}>
		<CourseOverview.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
