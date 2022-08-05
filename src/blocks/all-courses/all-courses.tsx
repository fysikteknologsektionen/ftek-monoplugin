import { useState } from '@wordpress/element';
import { _x, __ } from '@wordpress/i18n';
import { filter as filterIcon, Icon } from '@wordpress/icons';

import CheckboxGroup from '../../components/checkbox-group';
import CourseLinks from '../../components/course-links';
import Dropdown from '../../components/dropdown';
import { withLabel } from '../../hocs/withLabel';
import useFetchAll from '../../hooks/useFetchAll';
import {
	fmtCourseCode,
	fmtCourseCredits,
	fmtProgramsYears,
	fmtSPs,
} from '../../utils/format';
import {
	CoursePageMeta,
	Program,
	PROGRAMS,
	StudyPeriod,
	STUDY_PERIODS,
	WPCoursePageMeta,
	WPPost,
	WPTaxonomyTerm,
	Year,
	YEARS,
} from '../../utils/types';

type Filter = {
	pageIndex: number;
	perPage: number;
	search: string;
	years: Year[];
	programs: Program[];
	sps: StudyPeriod[];
	programSyllabusIdBlacklist: number[];
};

const initialFilter = {
	pageIndex: 0,
	perPage: 10,
	search: '',
	years: [...YEARS],
	programs: [...PROGRAMS],
	sps: [...STUDY_PERIODS],
	programSyllabusIdBlacklist: [],
};

const intersects = <T,>(a: T[], b: T[]) => {
	for (const elem of a) {
		if (b.includes(elem)) {
			return true;
		}
	}
	return false;
};

const Input = withLabel(
	(props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />
);

function CourseList({
	filter,
	setFilter,
	programSyllabuses,
	posts,
	loading,
}: {
	filter: Filter;
	setFilter: (f: Filter) => void;
	programSyllabuses: WPTaxonomyTerm[];
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
					intersects(filter.years, meta.years)) &&
				(filter.programs.length === PROGRAMS.length ||
					intersects(filter.programs, meta.programs)) &&
				(filter.sps.length === STUDY_PERIODS.length ||
					intersects(filter.sps, meta.study_perionds)) &&
				(filter.programSyllabusIdBlacklist.length === 0 ||
					!!post['program-syllabus'].find(
						(id) => !filter.programSyllabusIdBlacklist.includes(id)
					))
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
					<Dropdown.Select
						disabled={loading}
						content={filter.perPage}
						options={[10, 20, 50, 100].map((value) => ({
							value,
							label: `${value}`,
						}))}
						onSelect={(value) => updateFilter({ perPage: value })}
					/>
					&nbsp;
					<button
						onClick={() =>
							updateFilter({
								years: [...YEARS],
								programs: [...PROGRAMS],
								sps: [...STUDY_PERIODS],
								programSyllabusIdBlacklist: [],
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
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
									}}
								>
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
													label: fmtProgramsYears(
														[],
														[year]
													),
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
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
									}}
								>
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
							{programSyllabuses.length > 0 && (
								<th>
									{__('Program syllabuses', 'ftek-plugin')}
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
												values={programSyllabuses
													.map((plan) => plan.id)
													.filter(
														(id) =>
															!filter.programSyllabusIdBlacklist.includes(
																id
															)
													)}
												boxes={programSyllabuses.map(
													(plan) => ({
														value: plan.id,
														label: plan.name,
													})
												)}
												onChange={(plans) =>
													updateFilter({
														programSyllabusIdBlacklist:
															programSyllabuses
																.map(
																	(plan) =>
																		plan.id
																)
																.filter(
																	(id) =>
																		!plans.includes(
																			id
																		)
																),
													})
												}
											/>
										</Dropdown>
									</span>
								</th>
							)}
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
											{fmtProgramsYears(
												meta.programs,
												meta.years
											)}
										</td>
										<td>{fmtSPs(meta.study_perionds)}</td>
										{programSyllabuses.length > 0 && (
											<td>
												{item['program-syllabus']
													.map((id) =>
														programSyllabuses.flatMap(
															(plan) =>
																plan.id === id
																	? [
																			plan.name,
																	  ]
																	: []
														)
													)
													.join(', ')}
											</td>
										)}
										<td>
											<CourseLinks meta={meta} />
										</td>
									</tr>
								);
							})}
						{filteredPosts.length === 0 && (
							<tr>
								<td
									colSpan={
										programSyllabuses.length > 0 ? 7 : 6
									}
								>
									{loading
										? __('Loading courses…', 'ftek-plugin')
										: __('No courses found', 'ftek-plugin')}
								</td>
							</tr>
						)}
						{filteredPosts.length > 0 && loading && (
							<tr>
								<td
									colSpan={
										programSyllabuses.length > 0 ? 7 : 6
									}
								>
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
	const [posts, loadingPosts] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});
	const [programSyllabuses, loadingProgramSyllabuses] =
		useFetchAll<WPTaxonomyTerm>({
			path: '/wp/v2/program-syllabus',
		});

	return (
		<CourseList
			filter={filter}
			setFilter={setFilter}
			programSyllabuses={programSyllabuses}
			posts={posts}
			loading={loadingPosts || loadingProgramSyllabuses}
		/>
	);
};

AllCourses.Loading = (): JSX.Element => (
	<CourseList
		filter={initialFilter}
		setFilter={(f) => {}}
		programSyllabuses={[]}
		posts={[]}
		loading={true}
	/>
);
