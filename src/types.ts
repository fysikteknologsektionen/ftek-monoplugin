export type RoleKey = string;

export type Role = { key: RoleKey; name: string };

export type OAuthUser = { email_pattern: string; roles: RoleKey[] };

export type Option = {
	oauth_discovery_doc_url: string;
	oauth_client_id: string;
	oauth_client_secret: string;
	oauth_users: OAuthUser[];
	google_api_key: string;
};

export type Inline = {
	roles: Role[];
	oauth_redirect_uri: string;
};
