export type RoleKey = string;

export type Role = { key: RoleKey; name: string };

export type OAuthUser = { email_pattern: string; roles: RoleKey[] };

export const BACHELOR_YEARS = ['1', '2', '3'] as const;
export const YEARS = [...BACHELOR_YEARS, 'master'] as const;
export const PROGRAMS = ['F', 'TM'] as const;
export const STUDY_PERIODS = ['1', '2', '3', '4'] as const;

export type BachelorYear = typeof BACHELOR_YEARS[number];
export type Year = typeof YEARS[number];
export type Program = typeof PROGRAMS[number];
export type StudyPeriod = typeof STUDY_PERIODS[number];

export type StudyPeriodEnd = { month: number; day: number };

export type Option = {
	oauth_discovery_doc_url: string;
	oauth_client_id: string;
	oauth_client_secret: string;
	oauth_users: OAuthUser[];
	google_api_key: string;
	study_period_ends: { [sp in StudyPeriod]: StudyPeriodEnd };
	schedules: { [y in Exclude<Year, 'master'>]: { [p in Program]: string } };
};

export type WPOption = { ftek_plugin_option: Option };

export type Inline = {
	roles: Role[];
	oauthRedirectUri: string;
	assets: {
		openBook: string;
		group: string;
		facebook: string;
		instagram: string;
		snapchat: string;
		youtube: string;
	};
};

export type WPBlock = [string, { [k: string]: unknown }];

export type CoursePageMeta = {
	code: string;
	credits: number;
	homepage_url: string;
	info_url: string;
	survey_url: string;
	student_representatives: { name: string; cid: string }[];
	study_perionds: StudyPeriod[];
	year: '' | Year;
	programs: Program[];
	participant_count: number;
	elective: boolean;
	comment: string;
};

export type WPCoursePageMeta = {
	ftek_plugin_course_page_meta: CoursePageMeta;
};

export type GroupPageMeta = {
	logo_url: string;
	group_tag_id: number;
	email: string;
	facebook: string;
	instagram: string;
	snapchat: string;
	youtube: string;
};
export type WPGroupPageMeta = {
	ftek_plugin_group_page_meta: GroupPageMeta;
};

export type WPPost<T = unknown> = {
	id: number;
	meta: T;
	link: string;
	title: {
		rendered: string;
	};
};

export type WPTag = {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
};

export type BlockJson<T extends {}> = {
	attributes: {
		[K in keyof T]: {
			default: T[K];
		};
	};
};
