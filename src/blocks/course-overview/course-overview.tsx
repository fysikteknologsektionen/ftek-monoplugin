import { Fragment, useMemo, useState } from '@wordpress/element';
import { _x, __ } from '@wordpress/i18n';

import Dropdown from '../../components/dropdown';
import useFetchAll from '../../hooks/useFetchAll';
import { fmtProgramsYear, fmtYear } from '../../utils/format';
import {
	BachelorYear,
	BACHELOR_YEARS,
	PROGRAMS,
	StudyPeriod,
	STUDY_PERIODS,
	WPCoursePageMeta,
	WPPost,
	WPTaxonomyTerm,
} from '../../utils/types';

const EXTENDED_PROGRAMS = ['multiple', ...PROGRAMS] as const;

type ExtendedProgram = typeof EXTENDED_PROGRAMS[number];

type PostView = {
	title: string;
	link: string;
	comments: string[];
};

type CoursesInAYear = {
	[P in ExtendedProgram]: { [S in StudyPeriod]: PostView[] };
};

type AllBachelorsCourses = { [Y in BachelorYear]: CoursesInAYear };

type Footnotes = { [k: string]: number };

const organizePosts = (
	allPosts: WPPost<WPCoursePageMeta>[]
): [AllBachelorsCourses, Footnotes] => {
	const posts = Object.fromEntries(
		BACHELOR_YEARS.map((year) => [
			year,
			Object.fromEntries(
				EXTENDED_PROGRAMS.map((program) => [
					program,
					Object.fromEntries(STUDY_PERIODS.map((sp) => [sp, []])),
				])
			),
		])
	) as AllBachelorsCourses;

	let footnotesIndex = 1;
	const electiveCourseComment = __('Elective course', 'ftek-plugin');
	const footnotes: Footnotes = {};

	allPosts.forEach((post) => {
		const {
			programs: prog,
			year,
			study_perionds: studyPerionds,
			comment,
			elective,
		} = post.meta.ftek_plugin_course_page_meta;

		if (prog.length <= 0 || !year) {
			return;
		}

		const comments = [
			...(elective ? [electiveCourseComment] : []),
			...(comment ? [comment] : []),
		];
		comments.forEach((c) => {
			if (!(c in footnotes)) {
				footnotes[c] = footnotesIndex++;
			}
		});

		const program: ExtendedProgram = prog.length > 1 ? 'multiple' : prog[0];

		studyPerionds.forEach((sp) => {
			posts[year as BachelorYear][program][sp].push({
				title: post.title.rendered,
				link: post.link,
				comments,
			});
		});
	});

	return [posts, footnotes];
};

const YearOverview = ({
	posts,
	year,
	loading,
	footnotes,
}: {
	posts: CoursesInAYear;
	year: BachelorYear;
	loading: boolean;
	footnotes: { [k: string]: number };
}): JSX.Element => {
	const maxCourses = Object.fromEntries(
		EXTENDED_PROGRAMS.map((program) => [
			program,
			Math.max(...Object.values(posts[program]).map((p) => p.length)),
		])
	) as { [P in ExtendedProgram]: number };

	if (Math.max(...Object.values(maxCourses)) <= 0) {
		return loading ? (
			<p>{__('Loading courses…', 'ftek-plugin')}</p>
		) : (
			<p>{__('No courses found', 'ftek-plugin')}</p>
		);
	}

	const head = (
		<tr>
			<th />
			{STUDY_PERIODS.map((sp, i) => (
				<th key={i}>
					{
						// translators: %1$s Number of the study period
						__('Study period %1$s', 'ftek-plugin').replace(
							'%1$s',
							sp
						)
					}
				</th>
			))}
		</tr>
	);

	const body = EXTENDED_PROGRAMS.map((program, i) => {
		const p = posts[program];
		const rows = maxCourses[program];
		return [...Array(maxCourses[program]).keys()].map((j) => (
			<tr
				key={`${i}.${j}`}
				className={`ftek-plugin-row-${
					(i + 1) % 2 === 0 ? 'even' : 'odd'
				}`}
			>
				{j === 0 && (
					<th rowSpan={rows}>
						{program === 'multiple'
							? // translators: %1$s Number of the year
							  _x('Y%1$s', 'grade', 'ftek-plugin').replace(
									'%1$s',
									year
							  )
							: fmtProgramsYear([program], year)}
					</th>
				)}
				{STUDY_PERIODS.flatMap((sp, l) => {
					if (j > p[sp].length) {
						return [];
					}
					if (j === p[sp].length) {
						return [<td key={l} rowSpan={rows - j} />];
					}
					const post = p[sp][j];
					return [
						<td key={l}>
							<a href={post.link}>{post.title}</a>
							{post.comments.map((comment, k) => {
								const idx = footnotes[comment];
								return (
									<sup key={k}>
										{k > 0 && ','}
										<a href={`#table-footnote-${idx}`}>
											{idx}
										</a>
									</sup>
								);
							})}
						</td>,
					];
				})}
			</tr>
		));
	});

	return (
		<>
			<div style={{ overflowX: 'auto' }}>
				<table style={{ width: '100%' }}>
					<thead>{head}</thead>
					<tbody>{body}</tbody>
				</table>
			</div>
			{loading && (
				<span>{__('Loading more courses…', 'ftek-plugin')}</span>
			)}
		</>
	);
};

const OverviewTable = ({
	posts,
	controls = false,
	footnotes,
	loading,
}: {
	posts: AllBachelorsCourses;
	controls?: React.ReactNode;
	footnotes: Footnotes;
	loading: boolean;
}): JSX.Element => (
	<>
		{BACHELOR_YEARS.map((year, i) => (
			<Fragment key={i}>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap-reverse',
						alignItems: 'center',
					}}
				>
					<h3 style={{ flexGrow: 1 }}>{fmtYear(year)}</h3>
					{i === 0 && <span>{controls}</span>}
				</div>
				<YearOverview
					year={year}
					posts={posts[year]}
					loading={loading}
					footnotes={footnotes}
				/>
			</Fragment>
		))}
	</>
);

export const CourseOverview = (): JSX.Element => {
	const [allPosts, loadingPosts] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});
	const [programSyllabuses, loadingProgramSyllabuses] =
		useFetchAll<WPTaxonomyTerm>({
			path: '/wp/v2/program-syllabus',
		});

	const [programSyllabusId, setProgramSyllabusId] = useState(-1);

	const [posts, footnotes] = useMemo(
		() =>
			organizePosts(
				programSyllabusId < 0
					? allPosts
					: allPosts.filter(
							(post) =>
								post['program-syllabus'].length > 0 &&
								post['program-syllabus'].includes(
									programSyllabusId
								)
					  )
			),
		[allPosts, programSyllabuses, programSyllabusId]
	);
	const footnotesEntries = Object.entries(footnotes);

	const controls = programSyllabuses.length > 0 && (
		<Dropdown.Select
			disabled={loadingProgramSyllabuses}
			content={
				[
					{ id: -1, name: __('Program syllabus', 'ftek-plugin') },
					...programSyllabuses,
				].find((syllabus) => syllabus.id === programSyllabusId)?.name
			}
			options={[
				{ id: -1, name: __('All program syllabuses', 'ftek-plugin') },
				...programSyllabuses,
			].map((syllabus) => ({
				value: syllabus.id,
				label: syllabus.name,
			}))}
			onSelect={setProgramSyllabusId}
		/>
	);

	return (
		<>
			<OverviewTable
				posts={posts}
				controls={controls}
				footnotes={footnotes}
				loading={loadingPosts}
			/>
			{footnotesEntries.length > 0 && (
				<p>
					{footnotesEntries.map(([text, idx], i) => (
						<Fragment key={i}>
							{i > 0 && <br />}
							<span id={`table-footnote-${idx}`}>
								<sup>{idx}</sup>
								{text}
							</span>
						</Fragment>
					))}
				</p>
			)}
		</>
	);
};

CourseOverview.Loading = (): JSX.Element => {
	const [posts, footnotes] = organizePosts([]);
	return <OverviewTable posts={posts} footnotes={footnotes} loading={true} />;
};
