import { useState } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';

import {
	fmtCourseCode,
	fmtCourseCredits,
	fmtProgramsYear,
	fmtSPs,
	fmtYear,
} from '../../utils/format';
import {
	Year,
	WPPost,
	WPCoursePageMeta,
	StudyPeriod,
	Program,
	CoursePageMeta,
	YEARS,
	PROGRAMS,
	STUDY_PERIODS,
} from '../../utils/types';
import { filter as filterIcon, Icon } from '@wordpress/icons';
import useFetchAll from '../../hooks/useFetchAll';
import Dropdown from '../../components/dropdown';
import CourseLinks from '../../components/course-links';

type Filter = {
	pageIndex: number;
	perPage: number;
	search: string;
	years: Year[];
	programs: Program[];
	sps: StudyPeriod[];
};

const initialFilter = {
	pageIndex: 0,
	perPage: 10,
	search: '',
	years: [...YEARS],
	programs: [...PROGRAMS],
	sps: [...STUDY_PERIODS],
};

const intersects = <T,>(a: T[], b: T[]) => {
	for (const elem of a) {
		if (b.includes(elem)) {
			return true;
		}
	}
	return false;
};

const withLabel =
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

const Input = withLabel(
	(props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />
);

const Select = withLabel(
	(props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
		<select {...props} />
	)
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

function CourseList({
	filter,
	setFilter,
	posts,
	loading,
}: {
	filter: Filter;
	setFilter: (f: Filter) => void;
	posts: WPPost<WPCoursePageMeta>[];
	loading: boolean;
}): JSX.Element {
	const updateFilter = (f: Partial<Filter>) =>
		setFilter({ ...filter, pageIndex: 0, ...f });

	const lcSearch = filter.search.toLowerCase();
	const filteredPosts = posts
		.filter((post) => {
			const meta: CoursePageMeta = post.meta.ftek_plugin_course_page_meta;
			return (
				(post.title.rendered.toLowerCase().includes(lcSearch) ||
					meta.code.toLocaleLowerCase().includes(lcSearch)) &&
				(filter.years.length === YEARS.length ||
					(filter.years as ('' | Year)[]).includes(meta.year)) &&
				(filter.programs.length === PROGRAMS.length ||
					intersects(filter.programs, meta.programs)) &&
				(filter.sps.length === STUDY_PERIODS.length ||
					intersects(filter.sps, meta.study_perionds))
			);
		})
		.sort(
			(a, b) =>
				b.meta.ftek_plugin_course_page_meta.participant_count -
				a.meta.ftek_plugin_course_page_meta.participant_count
		);

	return (
		<div>
			<div style={{ display: 'flex', flexWrap: 'wrap-reverse' }}>
				<div style={{ flexGrow: 1 }}>
					<Dropdown
						content={
							<span>
								{filter.perPage}
								<span
									style={{
										marginLeft: '0.5rem',
										display: 'inline-block',
										transform: 'rotate(90deg)',
									}}
								>
									❯
								</span>
							</span>
						}
					>
						{(close) =>
							[10, 20, 50, 100].map((value) => (
								<a
									style={{
										display: 'block',
										cursor: 'pointer',
									}}
									onClick={() => {
										close();
										updateFilter({ perPage: value });
									}}
								>
									{value}
								</a>
							))
						}
					</Dropdown>
					&nbsp;
					<button
						onClick={() =>
							updateFilter({
								years: [...YEARS],
								programs: [...PROGRAMS],
								sps: [...STUDY_PERIODS],
							})
						}
					>
						{__('Clear filters', 'ftek-plugin')}
					</button>
				</div>
				<div style={{ marginBottom: '0.5rem' }}>
					<Input
						type="text"
						label={_x('Search: ', 'course page', 'ftek-plugin')}
						defaultValue={filter.search}
						onChange={(e) =>
							updateFilter({ search: e.target.value })
						}
					/>
				</div>
			</div>
			<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
				<table style={{ width: '100%', overflow: 'hidden' }}>
					<thead>
						<tr>
							<th>{__('Course page', 'ftek-plugin')}</th>
							<th>{__('Course code', 'ftek-plugin')}</th>
							<th>{__('Credits', 'ftek-plugin')}</th>
							<th>
								<div>
									{_x('Year', 'grade', 'ftek-plugin')}
									&nbsp;
									<span style={{ fontWeight: 'normal' }}>
										<Dropdown
											disabled={loading}
											content={
												<Icon
													icon={filterIcon}
													size={20}
												/>
											}
										>
											<CheckboxGroup
												values={filter.years}
												boxes={YEARS.map((year) => ({
													value: year,
													label: fmtYear(year),
												}))}
												onChange={(years) =>
													updateFilter({ years })
												}
											/>
											<CheckboxGroup
												values={filter.programs}
												boxes={PROGRAMS.map((prog) => ({
													value: prog,
													label: prog,
												}))}
												onChange={(programs) =>
													updateFilter({
														programs,
													})
												}
											/>
										</Dropdown>
									</span>
								</div>
							</th>
							<th>
								<div>
									{__('Study period', 'ftek-plugin')}
									&nbsp;
									<span style={{ fontWeight: 'normal' }}>
										<Dropdown
											disabled={loading}
											content={
												<Icon
													icon={filterIcon}
													size={20}
												/>
											}
										>
											<CheckboxGroup
												values={filter.sps}
												boxes={STUDY_PERIODS.map(
													(sp) => ({
														value: sp,
														label: fmtSPs([sp]),
													})
												)}
												onChange={(sps) =>
													updateFilter({ sps })
												}
											/>
										</Dropdown>
									</span>
								</div>
							</th>
							<th>{__('Links', 'ftek-plugin')}</th>
						</tr>
					</thead>
					<tbody>
						{filteredPosts
							.slice(
								filter.pageIndex * filter.perPage,
								(filter.pageIndex + 1) * filter.perPage
							)
							.map((item, i) => {
								const meta =
									item.meta.ftek_plugin_course_page_meta;

								return (
									<tr key={i}>
										<td>
											<a href={item.link}>
												{item.title.rendered}
											</a>
										</td>
										<td>{fmtCourseCode(meta.code)}</td>
										<td>
											{fmtCourseCredits(meta.credits)}
										</td>
										<td>
											{fmtProgramsYear(
												meta.programs,
												meta.year
											)}
										</td>
										<td>{fmtSPs(meta.study_perionds)}</td>
										<td>
											<CourseLinks meta={meta} />
										</td>
									</tr>
								);
							})}
						{filteredPosts.length === 0 && (
							<tr>
								<td colSpan={6}>
									{loading
										? __('Loading courses…', 'ftek-plugin')
										: __('No courses found', 'ftek-plugin')}
								</td>
							</tr>
						)}
						{filteredPosts.length > 0 && loading && (
							<tr>
								<td colSpan={6}>
									{__('Loading more courses…', 'ftek-plugin')}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div style={{ display: 'flex', marginTop: '0.5rem' }}>
				<small style={{ flexGrow: 1 }}>
					{
						// translators: %1$s %2$s %3$s Numbers
						__(
							'Showing %1$s to %2$s of %3$s entries',
							'ftek-plugin'
						)
							.replace(
								'%1$s',
								Math.min(
									filter.pageIndex * filter.perPage + 1,
									filteredPosts.length
								).toString()
							)
							.replace(
								'%2$s',
								Math.min(
									(filter.pageIndex + 1) * filter.perPage,
									filteredPosts.length
								).toString()
							)
							.replace('%3$s', filteredPosts.length.toString())
					}
				</small>
				<div>
					<button
						disabled={filter.pageIndex <= 0}
						onClick={() =>
							updateFilter({ pageIndex: filter.pageIndex - 1 })
						}
					>
						{_x('Previous', 'course page', 'ftek-plugin')}
					</button>
					&nbsp;
					<button
						disabled={
							(filter.pageIndex + 1) * filter.perPage >=
							filteredPosts.length
						}
						onClick={() =>
							updateFilter({ pageIndex: filter.pageIndex + 1 })
						}
					>
						{_x('Next', 'course page', 'ftek-plugin')}
					</button>
				</div>
			</div>
		</div>
	);
}

export const AllCourses = (): JSX.Element => {
	const [filter, setFilter] = useState<Filter>(initialFilter);
	const [posts, loading] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});

	return (
		<CourseList
			filter={filter}
			setFilter={setFilter}
			posts={posts}
			loading={loading}
		/>
	);
};

AllCourses.Loading = (): JSX.Element => {
	return (
		<CourseList
			filter={initialFilter}
			setFilter={(f) => {}}
			posts={[]}
			loading={true}
		/>
	);
};
