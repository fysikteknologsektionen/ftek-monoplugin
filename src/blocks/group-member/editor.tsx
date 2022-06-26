import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	TextControl,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { GroupMember, Attributes } from './group-member';

import metadata from './block.json';

const Edit = ({
	attributes,
	setAttributes,
}: {
	attributes: Attributes;
	setAttributes: (attr: Attributes) => unknown;
}): JSX.Element => {
	const updateAttributes = (attr: Partial<Attributes>) =>
		setAttributes({ ...attributes, ...attr });

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Basic settings', 'ftek')}
					initialOpen={true}
				>
					<PanelRow>
						<CheckboxControl
							label={__('Connect to a WordPress user', 'ftek')}
							help={__(
								'WordPress users may in turn be linked to e.g. Google accounts through OAuth.',
								'ftek'
							)}
							checked={attributes.wordpress_user}
							onChange={(value: boolean) =>
								updateAttributes({ wordpress_user: value })
							}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__('Email', 'ftek')}
							value={attributes.email}
							onChange={(value: string) =>
								updateAttributes({ email: value })
							}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__('Post', 'ftek')}
							value={attributes.post}
							onChange={(value: string) =>
								updateAttributes({ post: value })
							}
						/>
					</PanelRow>
					{!attributes.wordpress_user && (
						<>
							<PanelRow>
								<TextControl
									label={__('First name', 'ftek')}
									value={attributes.first_name}
									onChange={(value: string) =>
										updateAttributes({ first_name: value })
									}
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={__('Last name', 'ftek')}
									value={attributes.last_name}
									onChange={(value: string) =>
										updateAttributes({ last_name: value })
									}
								/>
							</PanelRow>
						</>
					)}
					<PanelRow>
						<TextControl
							label={__('Nick name', 'ftek')}
							value={attributes.nick_name}
							onChange={(value: string) =>
								updateAttributes({ nick_name: value })
							}
						/>
					</PanelRow>
					{!attributes.wordpress_user && (
						<MediaUploadCheck>
							<PanelRow>
								<MediaUpload
									onSelect={(media) =>
										updateAttributes({
											picture: media.url,
										})
									}
									allowedTypes={['image']}
									render={({ open }) => (
										<Button
											variant="secondary"
											onClick={open}
										>
											{__('Select picture', 'ftek')}
										</Button>
									)}
								/>
								{attributes.picture && (
									<Button
										variant="secondary"
										onClick={() =>
											updateAttributes({
												picture: '',
											})
										}
									>
										{__('Remove picture', 'ftek')}
									</Button>
								)}
							</PanelRow>
						</MediaUploadCheck>
					)}
					<PanelRow>
						<TextControl
							label={__('Description', 'ftek')}
							value={attributes.description}
							onChange={(value: string) =>
								updateAttributes({ description: value })
							}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<GroupMember attributes={attributes} />
		</div>
	);
};

const Save = ({ attributes }: { attributes: Attributes }): JSX.Element => (
	<div {...useBlockProps.save()} data={JSON.stringify(attributes)}>
		<GroupMember.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
