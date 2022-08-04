import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	CheckboxControl,
	DropdownMenu,
	Icon,
	MenuItem,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl,
} from '@wordpress/components';
import { Fragment, render, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, menu, trash } from '@wordpress/icons';

import { fmtProgramsYear, fmtYear } from './utils/format';
import {
	BACHELOR_YEARS,
	Inline,
	OAuthUser,
	Option,
	PROGRAMS,
	RoleKey,
	STUDY_PERIODS,
	WPOption,
} from './utils/types';

declare const ftekInline: Inline;

type SettingsSectionParams = {
	option: Option;
	onChange: (v: Partial<Option>) => void;
};

const OAuthSettings = ({
	option,
	onChange,
}: SettingsSectionParams): JSX.Element => (
	<>
		<p>
			{__(
				'When creating your OAuth client, add the below URL as an authorized redirect URIs:',
				'ftek-plugin'
			)}
		</p>
		<p>
			<code>{ftekInline.oauthRedirectUri}</code>
		</p>
		<p
			dangerouslySetInnerHTML={{
				// translators: %1$s: Anchor attributes.
				__html: __(
					'For example, to log in with Google, create a Google OAuth client as a Google Workspace admin following the instructions <a %1$s>here</a>.',
					'ftek-plugin'
				).replace(
					'%1$s',
					'href="https://support.google.com/cloud/answer/6158849" target="_blank" rel="noopener noreferrer"'
				),
			}}
		/>
		<TextControl
			label={__('OAuth discovery document URL', 'ftek-plugin')}
			value={option.oauth_discovery_doc_url}
			onChange={(value: string) =>
				onChange({ oauth_discovery_doc_url: value })
			}
		/>
		<TextControl
			label={__('OAuth client ID', 'ftek-plugin')}
			value={option.oauth_client_id}
			type="password"
			onChange={(value: string) => onChange({ oauth_client_id: value })}
		/>
		<TextControl
			label={__('OAuth client secret', 'ftek-plugin')}
			value={option.oauth_client_secret}
			type="password"
			onChange={(value: string) =>
				onChange({ oauth_client_secret: value })
			}
		/>
	</>
);

const UsersSettings = ({
	option,
	onChange,
}: SettingsSectionParams): JSX.Element => {
	const UserRow = ({
		user,
		onDelete,
		onChange: onUserChange,
	}: {
		user: OAuthUser;
		onDelete: () => void;
		onChange: (v: Partial<OAuthUser>) => void;
	}): JSX.Element => {
		const toggleRole = (role: RoleKey, enable: boolean) => {
			const index = user.roles.indexOf(role);
			const a = { ...user };
			if (index >= 0 && !enable) {
				a.roles.splice(index, 1);
			} else if (index < 0 && enable) {
				a.roles.push(role);
			}
			onUserChange(a);
		};

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					marginBottom: '1rem',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						paddingBottom: '0.4rem',
					}}
				>
					<Button onClick={onDelete} variant="secondary">
						<Icon icon={trash} size={24} />
					</Button>
				</div>
				<div
					style={{
						flex: 1,
						marginLeft: '1rem',
						marginRight: '1rem',
					}}
				>
					<TextControl
						label={__('Email regex pattern', 'ftek-plugin')}
						onChange={(value: string) =>
							onUserChange({ email_pattern: value })
						}
						value={user.email_pattern}
					/>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						paddingBottom: '0.4rem',
					}}
				>
					<DropdownMenu
						icon={menu}
						label={__('Select roles', 'ftek-plugin')}
					>
						{() =>
							ftekInline.roles.map((role, i) => (
								<MenuItem key={`${i}`}>
									<CheckboxControl
										label={role.name}
										checked={user.roles.includes(role.key)}
										onChange={(checked: boolean) =>
											toggleRole(role.key, checked)
										}
									/>
								</MenuItem>
							))
						}
					</DropdownMenu>
				</div>
			</div>
		);
	};

	return (
		<>
			<p>
				{__(
					'Here you can enter regex pattern to be matched against user emails. For every match, you can select which roles should be applied to the user.',
					'ftek-plugin'
				)}
			</p>
			{option.oauth_users.map((user, i) => (
				<UserRow
					key={i}
					user={user}
					onDelete={() => {
						const a = [...option.oauth_users];
						a.splice(i, 1);
						onChange({ oauth_users: a });
					}}
					onChange={(value: Partial<OAuthUser>) => {
						const a = [...option.oauth_users];
						const b: typeof a[number] = { ...a[i], ...value };
						a[i] = b;
						onChange({ oauth_users: a });
					}}
				/>
			))}
			<Button
				onClick={() => {
					onChange({
						oauth_users: [
							...option.oauth_users,
							{ email_pattern: '', roles: [] },
						] as typeof option.oauth_users,
					});
				}}
				variant="secondary"
			>
				{__('Add pattern', 'ftek-plugin')}
			</Button>
		</>
	);
};

const GoogleApiSettings = ({
	option,
	onChange,
}: SettingsSectionParams): JSX.Element => (
	<>
		<p
			dangerouslySetInnerHTML={{
				// translators: %1$s, %2$s and %3$s are replaced with anchor attributes.
				__html: __(
					"Instructions for creating an API key as a Google Workspace admin are available in <a %1$s>Google's documentation</a>. Also read about <a %2$s>securing your API key</a>. Then make sure to <a %3$s>enable the Google Drive API</a> for your project.",
					'ftek-plugin'
				)
					.replace(
						'%1$s',
						'href="https://cloud.google.com/docs/authentication/api-keys#creating_an_api_key" target="blank" rel="noopener noreferrer"'
					)
					.replace(
						'%2$s',
						'href="https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key" target="blank" rel="noopener noreferrer"'
					)
					.replace(
						'%3$s',
						'href="https://console.developers.google.com/apis/api/drive.googleapis.com/overview" target="blank" rel="noopener noreferrer"'
					),
			}}
		/>
		<TextControl
			label={__('Google API key', 'ftek-plugin')}
			value={option.google_api_key}
			type="password"
			onChange={(value: string) => onChange({ google_api_key: value })}
		/>
	</>
);

const StudyPeriodsSettings = ({
	option,
	onChange,
}: SettingsSectionParams): JSX.Element => (
	<>
		<p>{__('Enter the final date of each study period.', 'ftek-plugin')}</p>
		{STUDY_PERIODS.map((sp) => (
			<div
				key={sp}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
				}}
			>
				<span>
					{
						// translators: %1$s Number of the study period
						__(
							'Last day of study period %1$s',
							'ftek-plugin'
						).replace('%1$s', sp)
					}
				</span>
				<SelectControl
					label={__('Month', 'ftek-plugin')}
					value={option.study_period_ends[sp].month}
					options={[...Array(12).keys()].map((i) => ({
						label: `${i + 1}`,
						value: i + 1,
					}))}
					onChange={(value) => {
						const sps = { ...option.study_period_ends };
						sps[sp] = { ...sps[sp], month: Number(value) };
						onChange({ study_period_ends: sps });
					}}
				/>
				<SelectControl
					label={__('Day', 'ftek-plugin')}
					value={option.study_period_ends[sp].day}
					options={[...Array(31).keys()].map((i) => ({
						label: `${i + 1}`,
						value: i + 1,
					}))}
					onChange={(value) => {
						const sps = { ...option.study_period_ends };
						sps[sp] = { ...sps[sp], day: Number(value) };
						onChange({ study_period_ends: sps });
					}}
				/>
			</div>
		))}
	</>
);

const SchedulesSettings = ({
	option,
	onChange,
}: SettingsSectionParams): JSX.Element => (
	<>
		<p>
			{__(
				'Enter the URL to the schedule for each class. The schedule should begin at the current week and end one year later.',
				'ftek-plugin'
			)}
		</p>
		{BACHELOR_YEARS.map((year, i) => {
			return (
				<Fragment key={i}>
					<h4>{fmtYear(year)}</h4>
					{PROGRAMS.map((program, j) => (
						<TextControl
							key={j}
							label={
								// translators: %1$s Name of program
								__(
									'URL to schedule for %1$s',
									'ftek-plugin'
								).replace(
									'%1$s',
									fmtProgramsYear([program], year)
								)
							}
							value={option.schedules[year][program]}
							onChange={(value: string) => {
								const schedules = { ...option.schedules };
								schedules[year] = {
									...schedules[year],
									[program]: value,
								};
								onChange({ schedules });
							}}
						/>
					))}
				</Fragment>
			);
		})}
	</>
);

const Settings = (): JSX.Element => {
	const [saveState, setSaveState] = useState<'saved' | 'unsaved' | 'saving'>(
		'saved'
	);
	const [option, setOption] = useState<Option>(null);
	const [error, setError] = useState<unknown>(null);

	const updateOption = (value: Partial<Option>) => {
		setSaveState('unsaved');
		setOption({ ...option, ...value });
	};

	useEffect(() => {
		apiFetch<WPOption>({ path: '/wp/v2/settings' })
			.then((response) => {
				setOption(response?.ftek_plugin_option);
			})
			.catch(setError);
	}, []);

	const save = () => {
		setSaveState('saving');
		apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: { ftek_plugin_option: option },
		})
			.then(() => setSaveState('saved'))
			.catch(setError);
	};

	const SettingsSection = ({
		section: Element,
	}: {
		section: (props: SettingsSectionParams) => JSX.Element;
	}): JSX.Element =>
		option ? (
			<Element option={option} onChange={updateOption} />
		) : (
			<Placeholder>
				<div style={{ margin: 'auto' }}>
					<Spinner />
				</div>
			</Placeholder>
		);

	return (
		<div>
			<h2>{__('Ftek Settings', 'ftek-plugin')}</h2>
			{error ? (
				<>
					<h3>
						{__('The following error has occurred:', 'ftek-plugin')}
					</h3>
					<pre style={{ color: '#f00' }}>
						{JSON.stringify(error, null, 4)}
					</pre>
				</>
			) : (
				<>
					<h3>{__('OAuth', 'ftek-plugin')}</h3>
					<SettingsSection section={OAuthSettings} />
					<h3>{__('Users', 'ftek-plugin')}</h3>
					<SettingsSection section={UsersSettings} />
					<h3>{__('Google API', 'ftek-plugin')}</h3>
					<SettingsSection section={GoogleApiSettings} />
					<h3>{__('Study Periods', 'ftek-plugin')}</h3>
					<SettingsSection section={StudyPeriodsSettings} />
					<h3>{__('Schedules', 'ftek-plugin')}</h3>
					<SettingsSection section={SchedulesSettings} />
					<p>
						<Button
							onClick={save}
							disabled={saveState !== 'unsaved'}
							variant="primary"
						>
							{saveState === 'saved'
								? __('Settings saved!', 'ftek-plugin')
								: __('Save changes', 'ftek-plugin')}
						</Button>
						{saveState === 'saving' && <Spinner />}
						{saveState === 'saved' && (
							<Icon icon={check} size={24} />
						)}
					</p>
				</>
			)}
		</div>
	);
};

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('ftek-plugin-settings');
	render(<Settings />, root);
});
