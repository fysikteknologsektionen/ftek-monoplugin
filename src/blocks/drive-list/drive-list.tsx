import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

export type Attributes = {
	url: string;
	depth: number;
	download: boolean;
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
	url?: string;
};

export function attrsOrDefault(attributes: Partial<Attributes>): Attributes {
	const { url = '', depth = 1, download = true } = attributes;
	return {
		url,
		depth: Number.isFinite(depth) && depth >= 1 ? depth : 1,
		download,
	};
}

const Folder = ({ tree }: { tree: Tree }): JSX.Element => (
	<ul className="ftek-list">
		{tree.map((file, i) => (
			<li key={`${i}`}>
				{file.type === 'file' ? (
					<a {...(file.url && { href: file.url })}>{file.name}</a>
				) : (
					<>
						<span className="ftek-folder-name">{file.name}</span>
						<Folder tree={file.children} />
					</>
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
	const { url, depth, download } = attrsOrDefault(attributes);

	const [loading, setLoading] = useState(true);
	const [tree, setTree] = useState<Tree>([]);
	useEffect(() => {
		apiFetch({
			path: `ftek/v1/drive/tree?url=${url}&depth=${depth}&download=${download}`,
		})
			.then((response) => setTree(response as Tree))
			.finally(() => setLoading(false));
	}, [url, depth, download]);

	if (loading) {
		return <DriveList.Loading />;
	}

	return tree.length > 0 ? (
		<Folder tree={tree} />
	) : (
		<span>{__('No files to display', 'ftek')}</span>
	);
};

DriveList.Loading = (): JSX.Element => (
	<Folder
		tree={[
			{
				type: 'file',
				name: __('Loading list…', 'ftek'),
			},
		]}
	/>
);
