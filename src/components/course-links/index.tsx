import { __ } from '@wordpress/i18n';
import { CoursePageMeta } from '../../utils/types';

const CourseLinks = ({
	header,
	meta,
}: {
	header?: React.ReactNode;
	meta: CoursePageMeta;
}): JSX.Element => {
	const linkItems: { text: string; url: string }[] = [
		{
			text: __('Course homepage', 'ftek'),
			url: meta.homepage_url,
		},
		{
			text: __('General info', 'ftek'),
			url: meta.info_url,
		},
		{
			text: __('Latest survey', 'ftek'),
			url: meta.survey_url,
		},
		...(meta.code
			? [
					{
						text: __('Exam statistics', 'ftek'),
						url: `https://stats.ftek.se/${meta.code}`,
					},
			  ]
			: []),
	].filter((link) => link.url);

	if (linkItems.length === 0) {
		return <></>;
	}

	return (
		<>
			{header}
			<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{linkItems.map((link, i) => (
					<li key={i}>
						<a
							target="_blank"
							rel="noopener noreferrer"
							href={link.url}
						>
							{link.text}
						</a>
					</li>
				))}
			</ul>
		</>
	);
};

export default CourseLinks;
