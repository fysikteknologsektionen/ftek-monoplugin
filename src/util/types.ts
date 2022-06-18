export type RoleKey = string;

export type Role = { key: RoleKey; name: string };

export type OAuthUser = { email_pattern: string; roles: RoleKey[] };

export type BachelorYear = '1' | '2' | '3';

export type Year = BachelorYear | 'master';

export type Program = 'F' | 'TM';

export type StudyPeriod = '1' | '2' | '3' | '4';

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

export type WPOption = { ftek_option: Option };

export type Inline = {
	roles: Role[];
	oauthRedirectUri: string;
	assets: {
		openBook: string;
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

export type WPCoursePageMeta = { ftek_course_page_meta: CoursePageMeta };

export type WPPost<T> = {
	meta: T;
	link: string;
	title: {
		rendered: string;
	};
};
