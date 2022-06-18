import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { CourseOverview } from './course-overview';

import metadata from './block.json';

const Edit = (): JSX.Element => (
	<div {...useBlockProps()}>
		<CourseOverview />
	</div>
);

const Save = (): JSX.Element => (
	<div {...useBlockProps.save()} data="{}">
		<CourseOverview.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
