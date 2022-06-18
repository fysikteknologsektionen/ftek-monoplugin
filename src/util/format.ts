import { __, _x } from '@wordpress/i18n';
import { Program, StudyPeriod, Year } from './types';

export const fmtCourseCode = (code: string): string =>
	code || __('Course Code', 'ftek');

export const fmtCourseCredits = (credits: number): string =>
	_x('%1$s hec', 'higher education credits', 'ftek').replace(
		'%1$s',
		(credits || 0).toString()
	);

export const fmtProgramsYear = (
	programs: Program[],
	year: '' | Year
): string => {
	if (year === 'master') {
		return __("Master's course", 'ftek');
	}
	if (programs.length > 0) {
		return programs
			.sort()
			.map((program) => program + year || '')
			.join(' ');
	}
	return _x('Year', 'grade', 'ftek');
};

export const fmtYear = (year: Year): string => {
	if (year === 'master') {
		return __("Master's course", 'ftek');
	}
	return _x('Year %1$s', 'grade', 'ftek').replace('%1$s', year);
};

export const fmtSPs = (sps: StudyPeriod[]): string =>
	sps.length > 0
		? sps
				.sort()
				.map((a) => [[parseInt(a)]])
				.reduce((previous, current) => {
					const range = previous[previous.length - 1];
					if (current[0][0] - range[range.length - 1] === 1) {
						range.push(current[0][0]);
					} else {
						previous.push(current[0]);
					}
					return previous;
				})
				.map((range) =>
					_x('SP%1$s', 'study period', 'ftek').replace(
						'%1$s',
						range.length > 1
							? range[0] + '-' + range[range.length - 1]
							: range[0].toString()
					)
				)
				.join(' ')
		: _x('SP', 'study period', 'ftek');
