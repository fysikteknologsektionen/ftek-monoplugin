import { render, useEffect, useState } from '@wordpress/element';
import { check } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { trash, menu } from '@wordpress/icons';
import {
	Placeholder,
	Spinner,
	TextControl,
	Button,
	Icon,
	DropdownMenu,
	MenuItem,
	CheckboxControl,
} from '@wordpress/components';

import { Option, Inline, OAuthUser, RoleKey } from '../types';

declare const ftek_inline: Inline;

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
				'ftek'
			)}
		</p>
		<p>
			<code>{ftek_inline.oauth_redirect_uri}</code>
		</p>
		<TextControl
			label={__('OAuth discovery document URL', 'ftek')}
			value={option.oauth_discovery_doc_url}
			onChange={(value: string) =>
				onChange({ oauth_discovery_doc_url: value })
			}
		/>
		<TextControl
			label={__('OAuth client ID', 'ftek')}
			value={option.oauth_client_id}
			type="password"
			onChange={(value: string) => onChange({ oauth_client_id: value })}
		/>
		<TextControl
			label={__('OAuth client secret', 'ftek')}
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
		onChange,
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
			onChange(a);
		};

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					marginBottom: '1em',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						paddingBottom: '0.4em',
					}}
				>
					<Button onClick={onDelete} isSecondary>
						<Icon icon={trash} size={24} />
					</Button>
				</div>
				<div
					style={{
						flex: 1,
						marginLeft: '1em',
						marginRight: '1em',
					}}
				>
					<TextControl
						label={__('Email regex pattern', 'ftek')}
						onChange={(value: string) =>
							onChange({ email_pattern: value })
						}
						value={user.email_pattern}
					/>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						paddingBottom: '0.4em',
					}}
				>
					<DropdownMenu
						icon={menu}
						label={__('Select roles', 'ftek')}
					>
						{() =>
							ftek_inline.roles.map((role, i) => (
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
					'ftek'
				)}
			</p>
			{option.oauth_users.map((user, i) => (
				<UserRow
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
				isSecondary
			>
				{__('Add pattern', 'ftek')}
			</Button>
		</>
	);
};

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
		apiFetch({ path: '/wp/v2/settings' })
			.then((response: { ftek_option: Option }) => {
				setOption(response?.ftek_option);
			})
			.catch(setError);
	}, []);

	const save = () => {
		setSaveState('saving');
		apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: { ftek_option: option },
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
			<h2>{__('Ftek Settings', 'ftek')}</h2>
			{error ? (
				<>
					<h3>{__('The following error has occurred:', 'ftek')}</h3>
					<pre style={{ color: '#f00' }}>
						{JSON.stringify(error, null, 4)}
					</pre>
				</>
			) : (
				<>
					<h3>{__('OAuth', 'ftek')}</h3>
					<SettingsSection section={OAuthSettings} />
					<h3>{__('Users', 'ftek')}</h3>
					<SettingsSection section={UsersSettings} />
					<p>
						<Button
							onClick={save}
							disabled={saveState !== 'unsaved'}
							isPrimary
						>
							{saveState === 'saved'
								? __('Settings saved!', 'ftek')
								: __('Save changes', 'ftek')}
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
	const root = document.getElementById('ftek-settings');
	render(<Settings />, root);
});
