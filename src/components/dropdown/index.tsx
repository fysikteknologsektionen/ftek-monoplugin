import { useState, useRef, useEffect } from '@wordpress/element';

const Menu = ({
	Button,
	children,
}: {
	Button: (props: { toggleExpanded?: () => void }) => JSX.Element;
	children: React.ReactNode;
}): JSX.Element => {
	const [expanded, setExpanded] = useState(false);
	const [position, setPosition] = useState<React.CSSProperties>({});
	const dropdownRef = useRef<HTMLDivElement>();
	const spanRef = useRef<HTMLSpanElement>();

	useEffect(() => {
		if (dropdownRef.current) {
			const callback = (event: MouseEvent) => {
				if (
					event.target instanceof Element &&
					!dropdownRef.current.contains(event.target)
				) {
					setExpanded(false);
				}
			};
			window.addEventListener('click', callback);
			return () => window.removeEventListener('click', callback);
		}
	}, [dropdownRef.current]);

	const updatePosition = () => {
		const spanRect = spanRef.current.getBoundingClientRect();
		const docRect = document.documentElement.getBoundingClientRect();
		const dropdownRect = dropdownRef.current.getBoundingClientRect();

		setPosition({
			left:
				spanRect.left + dropdownRect.width > docRect.right
					? spanRect.right - dropdownRect.width
					: spanRect.left,
			top:
				spanRect.bottom + dropdownRect.height > docRect.bottom
					? spanRect.top - dropdownRect.height
					: spanRect.bottom,
		});
	};

	useEffect(() => {
		if (dropdownRef.current && spanRef.current && expanded) {
			updatePosition();

			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition, true);

			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition, true);
			};
		}
	}, [dropdownRef.current, spanRef.current]);

	return (
		<span ref={spanRef} style={{ position: 'relative' }}>
			<Button toggleExpanded={() => setExpanded(!expanded)} />

			<div
				ref={dropdownRef}
				style={{
					backgroundColor: 'white',
					padding: '0.5em',
					position: 'fixed',
					width: 'max-content',
					zIndex: 100,
					...position,
					opacity: expanded ? 1 : 0,
					pointerEvents: expanded ? 'initial' : 'none',
				}}
			>
				{children}
			</div>
		</span>
	);
};

const Dropdown = ({
	content,
	children,
	disabled,
}: {
	content: React.ReactNode;
	children: React.ReactNode;
	disabled: boolean;
}): JSX.Element => {
	const Button = (props: { toggleExpanded?: () => void }): JSX.Element => (
		<button
			disabled={disabled}
			onClick={(e) => {
				e.stopPropagation();
				props.toggleExpanded?.();
			}}
		>
			{content}
		</button>
	);

	return disabled ? <Button /> : <Menu Button={Button}>{children}</Menu>;
};

export default Dropdown;
