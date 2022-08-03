export const withLabel =
	<T,>(
		Elem: (attr: T) => JSX.Element
	): ((
		attr: T & { label?: string; labelPosition?: 'before' | 'after' }
	) => JSX.Element) =>
	(props) => {
		if (!props.label) {
			return <Elem {...props} />;
		}

		const key = props.label
			.split('')
			.map((v) => v.charCodeAt(0))
			.reduce((a, v) => (a + ((a << 7) + (a << 3))) ^ v) // eslint-disable-line no-bitwise
			.toString(16);

		return (
			<label htmlFor={key}>
				{props?.labelPosition !== 'after' && props.label}
				<Elem {...props} id={key} />
				{props?.labelPosition === 'after' && props.label}
			</label>
		);
	};
