import apiFetch from '@wordpress/api-fetch';
import { Fragment, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Dropdown from '../../components/dropdown';
import useFetchAll from '../../hooks/useFetchAll';
import { fmtYear } from '../../utils/format';
import {
	BACHELOR_YEARS,
	Option,
	PROGRAMS,
	StudyPeriod,
	StudyPeriodEnd,
	WPCoursePageMeta,
	WPOption,
	WPPost,
	WPTaxonomyTerm,
} from '../../utils/types';

const CurrentCoursesList = ({
	posts,
	controls = false,
	option,
	loading,
}: {
	posts: WPPost<WPCoursePageMeta>[];
	controls?: React.ReactNode;
	option: Option;
	loading: boolean;
}): JSX.Element => (
	<>
		{BACHELOR_YEARS.map((year, i) => {
			const currentPosts = posts
				.filter(
					(post) =>
						post.meta.ftek_plugin_course_page_meta.year === year
				)
				.sort(
					(a, b) =>
						b.meta.ftek_plugin_course_page_meta.participant_count -
						a.meta.ftek_plugin_course_page_meta.participant_count
				);

			const scheduleLinks = PROGRAMS.filter(
				(prog) => option?.schedules?.[prog]
			)
				.map(
					(prog) =>
						`<a href="${option?.schedules?.[prog]}">${prog}</a>`
				)
				.join(', ');

			const __html =
				fmtYear(year) +
				(scheduleLinks
					? ' ' +
					  // translators: %1$s Hyperlink to a schedule
					  __('(Schedule %1$s)', 'ftek-plugin').replace(
							'%1$s',
							scheduleLinks
					  )
					: '');

			const noCoursesMessage = loading ? (
				<p>{__('Loading courses…', 'ftek-plugin')}</p>
			) : (
				<p>{__('No courses found', 'ftek-plugin')}</p>
			);

			return (
				<Fragment key={year}>
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap-reverse',
							alignItems: 'center',
						}}
					>
						<h3
							style={{ flexGrow: 1 }}
							dangerouslySetInnerHTML={{ __html }}
						/>
						{i === 0 && <span>{controls}</span>}
					</div>
					{currentPosts.length > 0 ? (
						<>
							<ul>
								{currentPosts.map((post, j) => (
									<li key={j}>
										<a href={post.link}>
											{post.title.rendered}
										</a>
									</li>
								))}
							</ul>
							{loading && (
								<span>
									{__('Loading more courses…', 'ftek-plugin')}
								</span>
							)}
						</>
					) : (
						noCoursesMessage
					)}
				</Fragment>
			);
		})}
	</>
);

export const CurrentCourses = (): JSX.Element => {
	const [option, setOption] = useState<Option>(null);
	const [currentSp, setCurrentSp] = useState<StudyPeriod>(null);

	const [allPosts, loadingPosts] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});

	const [programSyllabuses, loadingProgramSyllabuses] =
		useFetchAll<WPTaxonomyTerm>({
			path: '/wp/v2/program-syllabus',
		});

	const [programSyllabusId, _setProgramSyllabusId] = useState(
		Number(localStorage?.getItem('ftek-plugin-prgram-syllabus-id')) || -1
	);
	const setProgramSyllabusId = (value: number) => {
		try {
			localStorage?.setItem('ftek-plugin-prgram-syllabus-id', `${value}`);
		} catch {}
		_setProgramSyllabusId(value);
	};

	const posts = (
		programSyllabusId < 0
			? allPosts
			: allPosts.filter(
					(post) =>
						post['program-syllabus'].length > 0 &&
						post['program-syllabus'].includes(programSyllabusId)
			  )
	).filter((post) =>
		post.meta.ftek_plugin_course_page_meta.study_perionds.includes(
			currentSp
		)
	);

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

	useEffect(() => {
		apiFetch<WPOption>({ path: '/wp/v2/settings' }).then((response) => {
			setOption(response.ftek_plugin_option);

			const currentDate = new Date();
			const sps = (
				Object.entries(
					response.ftek_plugin_option.study_period_ends
				) as [StudyPeriod, StudyPeriodEnd][]
			)
				.map(([sp, ends]) => ({
					end: new Date(
						currentDate.getFullYear(),
						ends.month - 1,
						ends.day
					),
					sp,
				}))
				.sort((a, b) => a.end.valueOf() - b.end.valueOf());

			for (let i = sps.length - 1; i >= 0; i--) {
				if (currentDate > sps[i].end) {
					setCurrentSp(sps[(i + 1) % sps.length].sp);
					return;
				}
			}
			setCurrentSp(sps[0].sp);
		});
	}, []);

	return (
		<CurrentCoursesList
			posts={posts}
			controls={controls}
			option={option}
			loading={loadingPosts}
		/>
	);
};

CurrentCourses.Loading = (): JSX.Element => (
	<CurrentCoursesList posts={[]} option={null} loading={true} />
);
