import { PageAttributesCheck, store as editorStore } from '@wordpress/editor';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PanelBody, PanelRow, ComboboxControl } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { store as coreStore } from '@wordpress/core-data';

import { WPPost } from './utils/types';

function getTitle(post: WPPost): string {
	return post?.title?.rendered
		? decodeEntities(post.title.rendered)
		: `#${post.id} (${__('no title', 'ftek-plugin')})`;
}

function getItemPriority(name: string, searchValue: string): number {
	return name.startsWith(searchValue) ? name.length : 10000;
}

const Plugin = (): JSX.Element => {
	const { editPost } = useDispatch(editorStore);
	const [fieldValue, setFieldValue] = useState<string>(null);
	const { parentPost, parentPostId, items, postType } = useSelect(
		(select) => {
			const { getPostType, getEntityRecords, getEntityRecord } =
				select(coreStore);
			const { getCurrentPostId, getEditedPostAttribute } =
				select(editorStore);
			const postTypeSlug = getEditedPostAttribute('type');
			const pageId = getEditedPostAttribute('parent');
			const pType = getPostType(postTypeSlug);
			const postId = getCurrentPostId();
			const isHierarchical = pType?.hierarchical || false;
			const query = {
				per_page: 100,
				exclude: postId,
				parent_exclude: postId,
				_fields: 'id,title,parent',
				...(!!fieldValue ? { search: fieldValue } : {}),
			};

			return {
				parentPostId: pageId,
				parentPost: pageId
					? getEntityRecord('postType', 'group-page', pageId)
					: null,
				items: isHierarchical
					? getEntityRecords('postType', 'group-page', query)
					: [],
				postType: pType,
			};
		},
		[fieldValue]
	);

	const isHierarchical = postType?.hierarchical || false;
	const pageItems: WPPost[] = items || [];

	const parentOptions = useMemo(() => {
		const opts = pageItems
			.sort(
				(a, b) =>
					getItemPriority(a.title.rendered, fieldValue) -
					getItemPriority(b.title.rendered, fieldValue)
			)
			.map((item) => ({ value: item.id, label: item.title.rendered }));

		// Ensure the current parent is in the options list.
		const optsHasParent = !!opts.find(
			(item) => item.value === parentPostId
		);
		if (parentPost && !optsHasParent) {
			opts.unshift({
				value: parentPostId,
				label: getTitle(parentPost),
			});
		}
		return opts;
	}, [pageItems, fieldValue]);

	if (!isHierarchical) {
		return <></>;
	}

	return (
		<PageAttributesCheck>
			<PluginDocumentSettingPanel
				title={__('Ftek', 'ftek-plugin')}
				opened={true}
			>
				<PanelRow>
					<div style={{ flexGrow: 1 }}>
						<ComboboxControl
							label={__('Parent group', 'ftek-plugin')}
							value={parentPostId}
							options={parentOptions}
							onFilterValueChange={(value) =>
								setFieldValue(value)
							}
							onChange={(value) => editPost({ parent: value })}
						/>
					</div>
				</PanelRow>
			</PluginDocumentSettingPanel>
		</PageAttributesCheck>
	);
};

registerPlugin('ftek-plugin-sidebar', {
	render: Plugin,
});
