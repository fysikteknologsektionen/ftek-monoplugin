import { registerBlockType } from '@wordpress/blocks';
import { __, _x } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	TextControl,
	Button,
} from '@wordpress/components';
import { Attributes, IcsCalendar } from './ics-calendar';
import { trash } from '@wordpress/icons';

import { serialize } from '../../utils/dataAttribute';

import metadata from './block.json';

const CalendarsRow = ({
	attributes,
	updateAttributes,
}: {
	attributes: Attributes;
	updateAttributes: (attr: Partial<Attributes>) => unknown;
}): JSX.Element => (
	<div>
		<p>{__('Calendar urls', 'ftek-plugin')}</p>
		{attributes.calendars.map((calendar, i) => (
			<div
				key={i}
				style={{
					display: 'flex',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<Button
					icon={trash}
					onClick={() => {
						const cals = [...attributes.calendars];
						cals.splice(i, 1);
						updateAttributes({ calendars: cals });
					}}
				/>
				<div style={{ padding: '0.5rem' }}>
					<TextControl
						label={__('Name', 'ftek-plugin')}
						value={calendar.name}
						onChange={(value) => {
							const cals = [...attributes.calendars];
							cals[i] = {
								...calendar,
								name: value,
							};
							updateAttributes({
								calendars: cals,
							});
						}}
					/>
					<TextControl
						label={__('ICal url', 'ftek-plugin')}
						value={calendar.url}
						onChange={(value) => {
							const cal = [...attributes.calendars];
							cal[i] = {
								...calendar,
								url: value,
							};
							updateAttributes({
								calendars: cal,
							});
						}}
					/>
				</div>
			</div>
		))}
		<Button
			onClick={() =>
				updateAttributes({
					calendars: [...attributes.calendars, { name: '', url: '' }],
				})
			}
			variant="secondary"
		>
			{_x('Add', 'calendar', 'ftek-plugin')}
		</Button>
	</div>
);

const Edit = ({
	attributes,
	setAttributes,
}: {
	attributes: Attributes;
	setAttributes: (attr: Attributes) => unknown;
}): JSX.Element => {
	const updateAttributes = (attr: Partial<Attributes>) =>
		setAttributes({ ...attributes, ...attr });

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Basic settings', 'ftek-plugin')}
					initialOpen={true}
				>
					<PanelRow>
						<CalendarsRow
							attributes={attributes}
							updateAttributes={updateAttributes}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<IcsCalendar attributes={attributes} />
		</div>
	);
};

const Save = ({ attributes }: { attributes: Attributes }): JSX.Element => (
	<div {...useBlockProps.save()} data={serialize(attributes)}>
		<IcsCalendar.Loading />
	</div>
);

registerBlockType(metadata, { edit: Edit, save: Save });
