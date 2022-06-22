import {
	MediaUpload,
	MediaUploadCheck,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, PanelRow, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { registerBlockType } from '@wordpress/blocks';
import { registerPlugin } from '@wordpress/plugins';
import { GroupPage } from './group-page';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

import { GroupPageMeta, Inline, WPGroupPageMeta } from '../../utils/types';
import usePostMeta from '../../hooks/usePostMeta';

import SVGImage from '../../components/svg-image';

import metadata from './block.json';

declare const ftekInline: Inline;

const icon = (
	<SVGImage
		url={ftekInline.assets.group}
		style={{ width: 24, height: 24, marginLeft: 12 }}
	/>
);

const Controls = ({
	meta,
	updateMeta,
}: {
	meta: GroupPageMeta;
	updateMeta: (m: Partial<GroupPageMeta>) => void;
}) => (
	<PanelRow>
		<MediaUploadCheck>
			<MediaUpload
				onSelect={(media) => updateMeta({ logo_url: media.url })}
				allowedTypes={['image']}
				render={({ open }) => (
					<Button onClick={open}>{__('Select logo', 'ftek')}</Button>
				)}
			/>
			{meta.logo_url && (
				<Button
					variant="secondary"
					onClick={() => updateMeta({ logo_url: '' })}
				>
					{__('Remove logo', 'ftek')}
				</Button>
			)}
		</MediaUploadCheck>
	</PanelRow>
);

const Edit = ({
	attributes,
	setAttributes,
}: {
	attributes: GroupPageMeta;
	setAttributes: (m: GroupPageMeta) => void;
}): JSX.Element => {
	// This is a hack which forces the template to appear valid.
	// See https://github.com/WordPress/gutenberg/issues/11681
	useDispatch('core/block-editor').setTemplateValidity(true);

	const updateAttributes = (m: Partial<GroupPageMeta>) =>
		setAttributes({ ...meta, ...m });

	const maybeMeta = usePostMeta<GroupPageMeta, WPGroupPageMeta>(
		'ftek_group_page_meta',
		'group-page'
	);
	const [meta, updateMeta] = maybeMeta
		? maybeMeta
		: [attributes, updateAttributes];

	if (maybeMeta) {
		setAttributes(meta);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Group page', 'ftek')}
					initialOpen={true}
					icon={icon}
				>
					<Controls meta={meta} updateMeta={updateMeta} />
				</PanelBody>
			</InspectorControls>
			<GroupPage attributes={meta} />
		</>
	);
};

const Save = ({ attributes }: { attributes: GroupPageMeta }): JSX.Element => (
	<div {...useBlockProps.save()} data={JSON.stringify(attributes)}>
		<GroupPage.Loading attributes={attributes} />
	</div>
);

const Plugin = (): JSX.Element => {
	const maybeMeta = usePostMeta<GroupPageMeta, WPGroupPageMeta>(
		'ftek_group_page_meta',
		'group-page'
	);
	if (!maybeMeta) {
		return <></>;
	}
	const [meta, updateMeta] = maybeMeta;

	return (
		<PluginDocumentSettingPanel
			title={__('Group page', 'ftek')}
			opened={true}
			icon={icon}
		>
			<Controls meta={meta} updateMeta={updateMeta} />
		</PluginDocumentSettingPanel>
	);
};

registerBlockType(metadata, { edit: Edit, save: Save, icon });

registerPlugin('group-page', {
	render: Plugin,
	icon,
});
