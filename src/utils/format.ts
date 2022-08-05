import { _x, __ } from '@wordpress/i18n';
import { Program, StudyPeriod, Year } from './types';

export const fmtCourseCode = (code: string): string =>
	code || __('Course Code', 'ftek-plugin');

export const fmtCourseCredits = (credits: number): string =>
	// translators: %1$s Number of hec
	_x('%1$s hec', 'higher education credits', 'ftek-plugin').replace(
		'%1$s',
		(credits || 0).toString()
	);

export const fmtProgramsYears = (
	programs: Program[],
	years: Year[]
): string => {
	if (programs.length === 0 && years.length === 0) {
		return '–';
	}

	const ys = years.filter((y) => y !== 'master');
	const numerics =
		ys.length > 0
			? ys
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
						range.length > 1
							? range[0] + '-' + range[range.length - 1]
							: range[0].toString()
					)
			: [];

	const words =
		programs.length > 0
			? programs
					.sort()
					.flatMap((prog) =>
						(numerics.length > 0 ? numerics : ['']).map(
							(num) => `${prog}${num}`
						)
					)
			: numerics.map((num) =>
					// translators: %1$s Numeric year range
					_x('Year %1$s', 'grade', 'ftek-plugin').replace('%1$s', num)
			  );

	if (years.includes('master')) {
		words.push(__("Master's course", 'ftek-plugin'));
	}

	return words.join(' ');
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
					// translators: %1$s Number of the study period
					_x('SP%1$s', 'study period', 'ftek-plugin').replace(
						'%1$s',
						range.length > 1
							? range[0] + '-' + range[range.length - 1]
							: range[0].toString()
					)
				)
				.join(' ')
		: _x('SP', 'study period', 'ftek-plugin');
