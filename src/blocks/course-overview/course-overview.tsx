import { _x, __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

import useFetchAll from '../../hooks/useFetchAll';
import {
	WPPost,
	WPCoursePageMeta,
	Program,
	StudyPeriod,
	BachelorYear,
} from '../../util/types';
import { fmtProgramsYear } from '../../util/format';

type ExtendedProgram = Program | 'multiple';

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
		(['1', '2', '3'] as BachelorYear[]).map((year) => [
			year,
			Object.fromEntries(
				(['F', 'TM', 'multiple'] as ExtendedProgram[]).map(
					(program) => [
						program,
						Object.fromEntries(
							(['1', '2', '3', '4'] as StudyPeriod[]).map(
								(sp) => [sp, []]
							)
						),
					]
				)
			),
		])
	) as AllBachelorsCourses;

	let footnotesIndex = 1;
	const electiveCourseComment = __('Elective course', 'ftek');
	const footnotes: Footnotes = {};

	allPosts.forEach((post) => {
		const {
			programs: prog,
			year,
			study_perionds: studyPerionds,
			comment,
			elective,
		} = post.meta.ftek_course_page_meta;

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
	const allPrograms = ['multiple', 'F', 'TM'] as ExtendedProgram[];

	const maxCourses = Object.fromEntries(
		allPrograms.map((program) => [
			program,
			Math.max(...Object.values(posts[program]).map((p) => p.length)),
		])
	) as { [P in ExtendedProgram]: number };

	if (Math.max(...Object.values(maxCourses)) <= 0) {
		return loading ? (
			<p>{__('Loading courses…', 'ftek')}</p>
		) : (
			<p>{__('No courses found', 'ftek')}</p>
		);
	}

	const head = (
		<tr>
			<th />
			{(['1', '2', '3', '4'] as StudyPeriod[]).map((sp, i) => (
				<th key={i}>
					{__('Study period %1$s', 'ftek').replace('%1$s', sp)}
				</th>
			))}
		</tr>
	);

	const body = allPrograms.map((program, i) => {
		const p = posts[program];
		const rows = maxCourses[program];
		return [...Array(maxCourses[program]).keys()].map((j) => (
			<tr key={`${i}.${j}`}>
				{j === 0 && (
					<th rowSpan={rows}>
						{program === 'multiple'
							? _x('Y%1$s', 'grade', 'ftek').replace('%1$s', year)
							: fmtProgramsYear([program], year)}
					</th>
				)}
				{(['1', '2', '3', '4'] as StudyPeriod[]).flatMap((sp, l) => {
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
			<table>
				<thead>{head}</thead>
				<tbody>{body}</tbody>
			</table>
			{loading && <span>{__('Loading more courses…', 'ftek')}</span>}
		</>
	);
};

const OverviewTable = ({
	posts,
	footnotes,
	loading,
}: {
	posts: AllBachelorsCourses;
	footnotes: Footnotes;
	loading: boolean;
}): JSX.Element => (
	<>
		{(['1', '2', '3'] as BachelorYear[]).map((year, i) => (
			<Fragment key={i}>
				<h3>
					{_x('Year %1$s', 'grade', 'ftek').replace('%1$s', year)}
				</h3>
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
	const [allPosts, loading] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});

	const [posts, footnotes] = organizePosts(allPosts);
	const footnotesEntries = Object.entries(footnotes);

	return (
		<>
			<OverviewTable
				posts={posts}
				footnotes={footnotes}
				loading={loading}
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
