import { useState, useRef, useEffect } from '@wordpress/element';

const Collapsible = ({
	header,
	children,
	initialOpen,
}: {
	header: React.ReactNode;
	children: React.ReactNode;
	initialOpen: boolean;
}): JSX.Element => {
	const [open, setOpen] = useState(initialOpen);
	const [scrollHeight, setScrollHeight] = useState(0);
	const headerRef = useRef<HTMLDivElement>();

	const updateScrollHeight = () =>
		setScrollHeight(headerRef.current.scrollHeight);

	useEffect(() => {
		if (headerRef.current) {
			updateScrollHeight();

			window.addEventListener('resize', updateScrollHeight);

			return () =>
				window.removeEventListener('resize', updateScrollHeight);
		}
	}, [headerRef]);

	const active = open ? { active: '' } : {};

	return (
		<>
			<div
				className="ftek-plugin-collapsible-header"
				onClick={() => setOpen(!open)}
				onKeyDown={() => setOpen(!open)}
				style={{ cursor: 'pointer' }}
				{...active}
				role="button"
				tabIndex={-1}
			>
				{header}
			</div>
			<div
				className="ftek-plugin-collapsible-content"
				ref={headerRef}
				{...active}
				style={{
					maxHeight: open ? scrollHeight : 0,
					overflow: 'hidden',
					transition: 'max-height 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				{children}
			</div>
		</>
	);
};

export default Collapsible;
