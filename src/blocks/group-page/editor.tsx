import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
	Button,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { GroupPage } from './group-page';

import usePostMeta from '../../hooks/usePostMeta';
import { serialize } from '../../utils/dataAttribute';
import { GroupPageMeta, Inline, WPGroupPageMeta } from '../../utils/types';

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
	<>
		<PanelRow>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={(media) => updateMeta({ logo_url: media.url })}
					allowedTypes={['image']}
					render={({ open }) => (
						<Button variant="secondary" onClick={open}>
							{__('Select logo', 'ftek-plugin')}
						</Button>
					)}
				/>
				{meta.logo_url && (
					<Button
						variant="secondary"
						onClick={() => updateMeta({ logo_url: '' })}
					>
						{__('Remove logo', 'ftek-plugin')}
					</Button>
				)}
			</MediaUploadCheck>
		</PanelRow>
		<PanelRow>
			<TextControl
				label={__('Email', 'ftek-plugin')}
				value={meta.email}
				onChange={(value: string) => updateMeta({ email: value })}
			/>
		</PanelRow>
		<PanelRow>
			<TextControl
				label={__('Facebook url', 'ftek-plugin')}
				value={meta.facebook}
				onChange={(value: string) => updateMeta({ facebook: value })}
			/>
		</PanelRow>
		<PanelRow>
			<TextControl
				label={__('Instagram url', 'ftek-plugin')}
				value={meta.instagram}
				onChange={(value: string) => updateMeta({ instagram: value })}
			/>
		</PanelRow>
		<PanelRow>
			<TextControl
				label={__('Snapchat url', 'ftek-plugin')}
				value={meta.snapchat}
				onChange={(value: string) => updateMeta({ snapchat: value })}
			/>
		</PanelRow>
		<PanelRow>
			<TextControl
				label={__('YouTube url', 'ftek-plugin')}
				value={meta.youtube}
				onChange={(value: string) => updateMeta({ youtube: value })}
			/>
		</PanelRow>
	</>
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
		'ftek_plugin_group_page_meta',
		'group-page'
	);
	const [meta, updateMeta] = maybeMeta
		? maybeMeta
		: [attributes, updateAttributes];

	if (maybeMeta) {
		setAttributes(meta);
	}

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Group page', 'ftek-plugin')}
					initialOpen={true}
					icon={icon}
				>
					<Controls meta={meta} updateMeta={updateMeta} />
				</PanelBody>
			</InspectorControls>
			<GroupPage attributes={meta} />
		</div>
	);
};

const Save = ({ attributes }: { attributes: GroupPageMeta }): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize(attributes)}>
		<GroupPage.Loading attributes={attributes} />
	</div>
);

const Plugin = (): JSX.Element => {
	const maybeMeta = usePostMeta<GroupPageMeta, WPGroupPageMeta>(
		'ftek_plugin_group_page_meta',
		'group-page'
	);
	if (!maybeMeta) {
		return <></>;
	}
	const [meta, updateMeta] = maybeMeta;

	return (
		<PluginDocumentSettingPanel
			title={__('Group page', 'ftek-plugin')}
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
