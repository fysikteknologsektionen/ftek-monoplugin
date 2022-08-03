import IcalExpander from 'ical-expander';

import { useState, useEffect } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export type Calendar = {
	name: string;
	url: string;
};

export type Attributes = {
	calendars: Calendar[];
};

type Entry = {
	title: string;
	description: string;
	start: Date;
	end: Date;
	calendar: Calendar;
};

type Range = {
	start: {
		year: number;
		month: number;
		date: number;
	};
	days: number;
};

const dayNames = [
	_x('Mon', 'day of week short', 'ftek-plugin'),
	_x('Tue', 'day of week short', 'ftek-plugin'),
	_x('Wed', 'day of week short', 'ftek-plugin'),
	_x('Thu', 'day of week short', 'ftek-plugin'),
	_x('Fri', 'day of week short', 'ftek-plugin'),
	_x('Sat', 'day of week short', 'ftek-plugin'),
	_x('Sun', 'day of week short', 'ftek-plugin'),
];

const CalendarGrid = ({ grid, range }: { grid: Entry[][]; range?: Range }) => {
	const daysInRange = range ? range.days : 7 * 6;

	let startDate = null, endDate = null;
	if (range) {
		startDate = new Date(range.start.year, range.start.month, range.start.date);
	}
	const endDate = range && new Date()

	const headers = [...Array(Math.min(7, daysInRange)).keys()].map((i) => {
		if (!startDate) {
			return <th>{__('Day', 'ftek-plugin')}</th>;
		}

		const date = new Date(startDate);
		date.setDate(date.getDate() + i);
		const DDMM = ` ${date.getDate()}/${date.getMonth() + 1}`;
		return (
			<th>{dayNames[date.getDay()] + (daysInRange <= 7 ? DDMM : '')}</th>
		);
	});

	const body = [];
	let row = [];
	const flushRow = () => {
		body.push(
			<tr>
				{row.map((cell) => (
					<td style={{ verticalAlign: 'top' }}>{cell}</td>
				))}
			</tr>
		);
		row = [];
	};
	for (let i = 0; i < daysInRange; i++) {
		let cellheader: React.ReactNode = false;
		if (startDate && daysInRange > 7) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);
			cellheader = (
				<div>{`${date.getDate()}/${date.getMonth() + 1}`}</div>
			);
		}

		const events = grid?.[i] || [];

		const items = events.map((event) => {
			if (startDate) {
				const startTime =
					event.start < startDate ? startDate : event.start;
				const end
				const endTime = 
			}
			return <li>{event.title}</li>;
		});

		row.push(
			<div>
				{cellheader}
				<div>
					<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
						{items}
					</ul>
				</div>
			</div>
		);

		if ((i + 1) % 7 == 0) {
			flushRow();
		}
	}
	if (row.length > 0) {
		flushRow();
	}

	return (
		<table>
			<thead>
				<tr>{headers}</tr>
			</thead>
			<tbody>{body}</tbody>
		</table>
	);
};

export const IcsCalendar = ({
	attributes,
}: {
	attributes: Attributes;
}): JSX.Element => {
	const [monthOffset, setMonthOffset] = useState(0);
	const [allEvents, setAllEvents] = useState<
		{ calendar: Calendar; response: any }[]
	>([]);
	const [range, setRange] = useState<Range>(null);
	const [grid, setGrid] = useState<Entry[][]>(null);

	useEffect(() => {
		const events: { calendar: Calendar; response: any }[] = [];
		Promise.allSettled(
			attributes.calendars.map((calendar) =>
				apiFetch<Response>({
					path: `/ftek-plugin/v1/calendar/proxy?url=${calendar.url}`,
					parse: false,
				})
					.then((value) => value.text())
					.then(
						(ics) => new IcalExpander({ ics, maxIterations: 100 })
					)
					.then((response) => events.push({ calendar, response }))
			)
		).then(() => setAllEvents(events));
	}, [attributes.calendars]);

	useEffect(() => {
		const start = new Date();
		start.setMonth(start.getMonth() + monthOffset);
		start.setDate(0);
		start.setDate(start.getDate() - start.getDay());
		setRange({
			start: {
				year: start.getFullYear(),
				month: start.getMonth(),
				date: start.getDate(),
			},
			days: 6 * 7,
		});
	}, [monthOffset]);

	useEffect(() => {
		if (!range) {
			return;
		}

		let _grid: Entry[][] = [...Array(range.days)].map(() => []);

		allEvents.forEach((evt) => {
			const startDate = new Date(
				range.start.year,
				range.start.month,
				range.start.date
			);
			const endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + range.days);
			const inRange = evt.response.between(startDate, endDate);

			const events = inRange.events.map((e) => ({
				startDate: e.startDate.toJSDate(),
				endDate: e.endDate.toJSDate(),
				summary: e.summary,
				description: e.description,
			}));
			const occurrences = inRange.occurrences.map((e) => ({
				startDate: e.startDate.toJSDate(),
				endDate: e.endDate.toJSDate(),
				summary: e.item.summary,
				description: e.item.description,
			}));

			[...events, ...occurrences].forEach((event) => {
				const approxMsInDay = 60 * 60 * 24 * 1000;
				const delta = event.startDate.getTime() - startDate.getTime();
				const i0 = Math.floor(Math.max(0, delta / approxMsInDay - 1));

				let d = new Date(startDate);
				d.setDate(d.getDate() + i0);
				let nextD = new Date(d);
				nextD.setDate(nextD.getDate() + 1);
				for (let i = i0; d < event.endDate && i < range.days; i++) {
					if (event.startDate < nextD) {
						_grid[i].push({
							title: event.summary,
							description: event.description,
							start: event.startDate,
							end: event.endDate,
							calendar: evt.calendar,
						});
					}

					d = new Date(nextD);
					nextD.setDate(nextD.getDate() + 1);
				}

				for (
					d.setDate(d.getDate() + i0);
					d < event.endDate && d < endDate;
					d.setDate(d.getDate() + 1)
				) {}
			});
		});

		_grid.forEach((cell) =>
			cell.sort((a, b) => a.start.getTime() - b.start.getTime())
		);

		setGrid(_grid);
	}, [allEvents, range]);

	return <CalendarGrid grid={grid} range={range} />;
};

IcsCalendar.Loading = (): JSX.Element => (
	<CalendarGrid grid={null} range={null} />
);
