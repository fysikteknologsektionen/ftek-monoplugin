import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import Dropdown from '../../components/dropdown';

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
	url: string;
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
					<a href={file.url}>{file.name}</a>
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
		apiFetch<Tree>({
			path: `ftek/v1/drive/tree?url=${url}&depth=${depth}&download=${download}`,
		})
			.then((response) => setTree(response))
			.finally(() => setLoading(false));
	}, [url, depth, download]);

	if (loading) {
		return <DriveList.Loading />;
	}

	return tree.length > 0 ? (
		<Folder tree={tree} />
	) : (
		<p>{__('No files to display', 'ftek')}</p>
	);
};

DriveList.Loading = (): JSX.Element => <p>{__('Loading files…', 'ftek')}</p>;
