export const SVGImage = ({
	url,
	...attributes
}: {
	url: string;
} & React.HTMLAttributes<SVGElement>): JSX.Element => (
	<svg {...attributes}>
		<image style={{ width: '100%' }} xlinkHref={url} />
	</svg>
);

export default SVGImage;
