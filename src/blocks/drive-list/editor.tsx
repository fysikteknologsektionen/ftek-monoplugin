import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
	CheckboxControl,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Attributes, attrsOrDefault, DriveList } from './drive-list';

import { serialize } from '../../utils/dataAttribute';

import metadata from './block.json';

const Edit = ({
	attributes,
	setAttributes,
}: {
	attributes: Attributes;
	setAttributes: (attr: Attributes) => unknown;
}): JSX.Element => {
	const {
		url,
		depth: _depth,
		download,
		collapsible,
	} = attrsOrDefault(attributes);
	const depth = Number.isNaN(attributes.depth) ? NaN : _depth;

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Basic settings', 'ftek-plugin')}
					initialOpen={true}
				>
					<PanelRow>
						<TextControl
							label={__('Shared folder URL', 'ftek-plugin')}
							value={url}
							placeholder="https://drive.google.com/drive/folders/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
							onChange={(value: string) => {
								setAttributes({
									...attributes,
									url: value,
								});
							}}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__('Scan depth', 'ftek-plugin')}
							help={__(
								'Number of subfolders to scan',
								'ftek-plugin'
							)}
							value={depth}
							type="number"
							min="1"
							onChange={(value: any) => {
								setAttributes({
									...attributes,
									depth: parseInt(value),
								});
							}}
						/>
					</PanelRow>
					<PanelRow>
						<CheckboxControl
							label={__('Download files', 'ftek-plugin')}
							help={__(
								'Download files or open in browser',
								'ftek-plugin'
							)}
							checked={download}
							onChange={(value: boolean) => {
								setAttributes({
									...attributes,
									download: value,
								});
							}}
						/>
					</PanelRow>
					<PanelRow>
						<CheckboxControl
							label={__('Collapsible folders', 'ftek-plugin')}
							checked={collapsible}
							onChange={(value: boolean) => {
								setAttributes({
									...attributes,
									collapsible: value,
								});
							}}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<DriveList attributes={attributes} />
		</div>
	);
};

const Save = ({ attributes }: { attributes: Attributes }): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize(attributes)}>
		<DriveList.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
