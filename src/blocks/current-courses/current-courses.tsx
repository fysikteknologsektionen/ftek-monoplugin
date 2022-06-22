import { Fragment, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import {
	Option,
	WPCoursePageMeta,
	WPPost,
	StudyPeriod,
	WPOption,
	StudyPeriodEnd,
	YEARS,
	PROGRAMS,
} from '../../utils/types';
import useFetchAll from '../../hooks/useFetchAll';
import { fmtYear } from '../../utils/format';

const CurrentCoursesList = ({
	posts,
	option,
	loading,
}: {
	posts: WPPost<WPCoursePageMeta>[];
	option: Option;
	loading: boolean;
}): JSX.Element => (
	<>
		{YEARS.map((year) => {
			const currentPosts = posts
				.filter((post) => post.meta.ftek_course_page_meta.year === year)
				.sort(
					(a, b) =>
						b.meta.ftek_course_page_meta.participant_count -
						a.meta.ftek_course_page_meta.participant_count
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
					  __('(Schedule %1$s)', 'ftek').replace(
							'%1$s',
							scheduleLinks
					  )
					: '');

			const noCoursesMessage = loading ? (
				<p>{__('Loading courses…', 'ftek')}</p>
			) : (
				<p>{__('No courses found', 'ftek')}</p>
			);

			return (
				<Fragment key={year}>
					<h3 dangerouslySetInnerHTML={{ __html }} />
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
									{__('Loading more courses…', 'ftek')}
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

	useEffect(() => {
		apiFetch<WPOption>({ path: '/wp/v2/settings' }).then((response) => {
			setOption(response.ftek_option);

			const currentDate = new Date();
			const sps = (
				Object.entries(response.ftek_option.study_period_ends) as [
					StudyPeriod,
					StudyPeriodEnd
				][]
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

	const [allPosts, loading] = useFetchAll<WPPost<WPCoursePageMeta>>({
		path: '/wp/v2/course-page',
	});

	const posts = allPosts.filter((post) =>
		post.meta.ftek_course_page_meta.study_perionds.includes(currentSp)
	);

	return (
		<CurrentCoursesList posts={posts} option={option} loading={loading} />
	);
};

CurrentCourses.Loading = (): JSX.Element => (
	<CurrentCoursesList posts={[]} option={null} loading={true} />
);
