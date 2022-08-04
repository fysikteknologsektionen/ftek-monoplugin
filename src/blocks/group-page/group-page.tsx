import apiFetch from '@wordpress/api-fetch';
import { InnerBlocks } from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import {
	GroupPageMeta,
	Inline,
	WPBlock,
	WPPost,
	WPTag,
} from '../../utils/types';
import { Attributes as GroupMemberAttributes } from '../group-member/group-member';

import SectionedPage from '../../components/sectioned-page';
import SVGImage from '../../components/svg-image';

declare const ftekInline: Inline;

const LoadingPosts = ({
	heading,
}: {
	heading: React.ReactNode;
}): JSX.Element => (
	<>
		{heading}
		<p>{__('Loading…', 'ftek-plugin')}</p>
	</>
);

const PostsByTag = ({
	heading,
	postType,
	tagId,
	limit = 100,
}: {
	heading: React.ReactNode;
	postType: string;
	tagId: number;
	limit?: number;
}): JSX.Element => {
	const [posts, setPosts] = useState<WPPost[]>(null);
	const [tag, setTag] = useState<WPTag>(null);

	useEffect(() => {
		apiFetch<WPPost[]>({
			path: `/wp/v2/${postType}?tags=${tagId}&per_page=${limit}`,
		}).then(setPosts);

		apiFetch<WPTag>({
			path: `/wp/v2/tags/${tagId}`,
		}).then(setTag);
	}, []);

	if (!posts) {
		return <LoadingPosts heading={heading} />;
	}

	if (posts.length === 0) {
		return <></>;
	}

	return (
		<>
			{heading}
			<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{posts.map((post, i) => (
					<li key={i}>
						<a href={post.link}>{post.title.rendered}</a>
					</li>
				))}
			</ul>
			{tag && tag.count > limit && (
				<p>
					<a href={tag.link}>{__('More…', 'ftek-plugin')}</a>
				</p>
			)}
		</>
	);
};

const GroupPageLogo = ({
	attributes,
}: {
	attributes: GroupPageMeta;
}): JSX.Element =>
	attributes.logo_url ? (
		<div className="ftek-plugin-group-page-logo">
			<img
				style={{ width: '100%' }}
				alt={__('Logo', 'ftek-plugin')}
				src={attributes.logo_url}
			/>
		</div>
	) : (
		<></>
	);

export const AsideDynamicArea = ({
	attributes,
	save = false,
}: {
	attributes: GroupPageMeta;
	save?: boolean;
}): JSX.Element => {
	const relatedPages = <h3>{__('Related pages', 'ftek-plugin')}</h3>;
	const latestPosts = <h3>{__('Latest posts', 'ftek-plugin')}</h3>;

	const logo = <GroupPageLogo attributes={attributes} />;

	const socials: { url: string; icon: string }[] = [
		{
			url: attributes.facebook,
			icon: ftekInline.assets.facebook,
		},
		{
			url: attributes.instagram,
			icon: ftekInline.assets.instagram,
		},
		{
			url: attributes.snapchat,
			icon: ftekInline.assets.snapchat,
		},
		{
			url: attributes.youtube,
			icon: ftekInline.assets.youtube,
		},
	];

	const hasSocials = socials.some((elem) => elem.url);
	const contact = (attributes.email || hasSocials) && (
		<div id="ftek-plugin-group-page-contact">
			<h3>{__('Contact', 'ftek-plugin')}</h3>
			{attributes.email && (
				<p>
					<a href={`mailto:${attributes.email}`}>
						{attributes.email}
					</a>
				</p>
			)}
			{hasSocials && (
				<div>
					{socials.map(
						(social, i) =>
							social.url && (
								<a
									key={i}
									href={social.url}
									style={{
										display: 'inline-block',
										margin: '0.5rem',
									}}
								>
									<SVGImage
										url={social.icon}
										style={{
											width: '2rem',
											height: '2rem',
											marginRight: '0.5rem',
										}}
									/>
								</a>
							)
					)}
				</div>
			)}
		</div>
	);

	if (save) {
		return (
			<>
				{logo}
				<LoadingPosts heading={relatedPages} />
				<LoadingPosts heading={latestPosts} />
				{contact}
			</>
		);
	}

	return (
		<>
			{logo}
			{attributes.group_tag_id > 0 && (
				<div id="ftek-plugin-group-page-related">
					<PostsByTag
						heading={relatedPages}
						postType="pages"
						tagId={attributes.group_tag_id}
					/>
					<PostsByTag
						heading={latestPosts}
						postType="posts"
						tagId={attributes.group_tag_id}
						limit={4}
					/>
				</div>
			)}
			{contact}
		</>
	);
};

export const MainDynamicArea = ({
	asideElement,
}: {
	asideElement: Element;
}): JSX.Element => {
	const [related, setRelated] = useState<ChildNode>(null);
	const [contact, setContact] = useState<ChildNode>(null);

	useEffect(() => {
		if (asideElement) {
			const observer = new MutationObserver(() => {
				setRelated(
					asideElement.querySelector(
						'#ftek-plugin-group-page-related'
					)?.firstChild
				);
				setContact(
					asideElement.querySelector(
						'#ftek-plugin-group-page-contact'
					)?.firstChild
				);
			});

			observer.observe(asideElement, { childList: true, subtree: true });

			return () => observer.disconnect();
		}

		setRelated(null);
		setContact(null);
	}, [asideElement]);

	return (
		<div className="navigation-buttons" style={{ paddingTop: '0.5rem' }}>
			{related && (
				<button
					style={{ marginRight: '0.5rem' }}
					onClick={() => related.parentElement.scrollIntoView()}
				>
					{__('Related pages', 'ftek-plugin')}
				</button>
			)}
			{contact && (
				<button onClick={() => contact.parentElement.scrollIntoView()}>
					{__('Contact', 'ftek-plugin')}
				</button>
			)}
		</div>
	);
};

export const StatelessGroupPage = ({
	attributes,
	save,
	asideRef = null,
}: {
	attributes: GroupPageMeta;
	save: boolean;
	asideRef?: React.MutableRefObject<HTMLDivElement>;
}): JSX.Element => {
	const innerBlocksTemplate: WPBlock[] = [
		[
			'core/heading',
			{ content: __('Description', 'ftek-plugin'), level: 3 },
		],
		[
			'core/paragraph',
			{
				placeholder: __('Description goes here.', 'ftek-plugin'),
			},
		],
		['core/heading', { content: __('Members', 'ftek-plugin'), level: 3 }],
		['ftek-plugin/group-member', {} as Partial<GroupMemberAttributes>],
	];

	return (
		<SectionedPage>
			<SectionedPage.Main>
				<GroupPageLogo attributes={attributes} />
				<div className="main-dynamic-area">
					{!save && (
						<MainDynamicArea asideElement={asideRef.current} />
					)}
				</div>
				{save ? (
					<InnerBlocks.Content />
				) : (
					<InnerBlocks
						template={innerBlocksTemplate}
						templateLock={false}
					/>
				)}
			</SectionedPage.Main>
			<SectionedPage.Aside>
				<div
					className="aside-dynamic-area"
					{...(asideRef ? { ref: asideRef } : {})}
				>
					<AsideDynamicArea attributes={attributes} save={save} />
				</div>
			</SectionedPage.Aside>
		</SectionedPage>
	);
};

export const GroupPage = ({
	attributes,
	save = false,
}: {
	attributes: GroupPageMeta;
	save?: boolean;
}): JSX.Element => {
	const asideRef = useRef<HTMLDivElement>();
	return (
		<StatelessGroupPage
			attributes={attributes}
			save={save}
			asideRef={asideRef}
		/>
	);
};

GroupPage.Loading = ({
	attributes,
}: {
	attributes: GroupPageMeta;
}): JSX.Element => <StatelessGroupPage attributes={attributes} save={true} />;
