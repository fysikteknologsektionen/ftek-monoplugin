import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

import Collapsible from '../../components/collapsible';

export type Attributes = {
	url: string;
	depth: number;
	download: boolean;
	collapsible: boolean;
};

export type Tree = (Folder | File)[];

export type Folder = {
	type: 'folder';
	name: string;
	children: Tree;
};

export type File = {
	type: 'file';
	name: string;
	url: string;
};

export function attrsOrDefault(attributes: Partial<Attributes>): Attributes {
	const {
		url = '',
		depth = 1,
		download = true,
		collapsible = false,
	} = attributes;
	return {
		url,
		depth: Number.isFinite(depth) && depth >= 1 ? depth : 1,
		download,
		collapsible,
	};
}

const Folder = ({
	tree,
	collapsible,
}: {
	tree: Tree;
	collapsible: boolean;
}): JSX.Element => (
	<ul className="ftek-plugin-list">
		{tree.map((file, i) => (
			<li
				key={`${i}`}
				style={
					file.type !== 'file' && collapsible
						? { listStyleType: 'none' }
						: {}
				}
			>
				{file.type === 'file' ? (
					<a href={file.url}>{file.name}</a>
				) : (
					(() => {
						const header = (
							<span className="ftek-plugin-folder-name">
								{file.name}
							</span>
						);
						const children = (
							<Folder
								tree={file.children}
								collapsible={collapsible}
							/>
						);
						return collapsible ? (
							<Collapsible header={header} initialOpen={false}>
								{children}
							</Collapsible>
						) : (
							<>
								{header}
								{children}
							</>
						);
					})()
				)}
			</li>
		))}
	</ul>
);

export const DriveList = ({
	attributes,
}: {
	attributes: Partial<Attributes>;
}): JSX.Element => {
	const { url, depth, download, collapsible } = attrsOrDefault(attributes);

	const [loading, setLoading] = useState(true);
	const [tree, setTree] = useState<Tree>([]);
	useEffect(() => {
		apiFetch<Tree>({
			path: `ftek-plugin/v1/drive/tree?url=${url}&depth=${depth}&download=${download}`,
		})
			.then((response) => setTree(response))
			.finally(() => setLoading(false));
	}, [url, depth, download]);

	if (loading) {
		return <DriveList.Loading />;
	}

	return tree.length > 0 ? (
		<Folder tree={tree} collapsible={collapsible} />
	) : (
		<p>{__('No files to display', 'ftek-plugin')}</p>
	);
};

DriveList.Loading = (): JSX.Element => (
	<p>{__('Loading files…', 'ftek-plugin')}</p>
);
