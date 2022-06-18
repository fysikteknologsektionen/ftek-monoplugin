export type RoleKey = string;

export type Role = { key: RoleKey; name: string };

export type OAuthUser = { email_pattern: string; roles: RoleKey[] };

export type Year = '1' | '2' | '3' | 'master';

export type Program = 'F' | 'TM';

export type StudyPeriod = '1' | '2' | '3' | '4';

export type Option = {
	oauth_discovery_doc_url: string;
	oauth_client_id: string;
	oauth_client_secret: string;
	oauth_users: OAuthUser[];
	google_api_key: string;
	study_period_ends: { [sp in StudyPeriod]: { month: number; day: number } };
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
