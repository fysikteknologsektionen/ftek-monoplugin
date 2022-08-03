import { withLabel } from '../../hocs/withLabel';

const Input = withLabel(
	(props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />
);

const CheckboxGroup = <T,>({
	values,
	boxes,
	onChange,
}: {
	values: T[];
	boxes: { label: string; value: T }[];
	onChange: (v: T[]) => void;
}): JSX.Element => (
	<>
		{boxes.map((box, i) => (
			<div key={i} style={{ textAlign: 'left' }}>
				<Input
					type="checkbox"
					defaultChecked={values.includes(box.value)}
					label={box.label}
					labelPosition="after"
					onChange={(e) => {
						const v = [...values];
						const index = v.indexOf(box.value);
						if (e.target.checked && index < 0) {
							v.push(box.value);
						}
						if (!e.target.checked && index >= 0) {
							v.splice(index, 1);
						}
						onChange(v);
					}}
				/>
			</div>
		))}
	</>
);

export default CheckboxGroup;
