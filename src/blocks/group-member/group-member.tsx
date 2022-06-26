import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

type User =
	| { found: false }
	| { found: true; first_name: string; last_name: string; picture: string };

export type Attributes = {
	email: string;
	post: string;
	wordpress_user: boolean;
	first_name: string;
	last_name: string;
	nick_name: string;
	description: string;
	picture: string;
};

const GroupMemberDisplay = ({
	email,
	mailto = true,
	post,
	firstName,
	lastName,
	nickName = null,
	description,
	picture = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg',
}: {
	email: string;
	mailto?: boolean;
	post: string;
	firstName: string;
	lastName: string;
	nickName?: string;
	description: string;
	picture?: string;
}): JSX.Element => (
	<div style={{ display: 'flex' }}>
		<div style={{ marginRight: '0.5em', flexShrink: 0 }}>
			<img
				src={picture}
				alt={__('Profile picture', 'ftek')}
				style={{ width: '5em' }}
			/>
		</div>
		<div>
			<div>
				<b>
					{firstName}{' '}
					{nickName ? (
						<>
							<q>{nickName}</q>{' '}
						</>
					) : (
						''
					)}
					{lastName}
				</b>
			</div>
			<div>
				<b>{post}</b>
				{email && (
					<>
						{' '}
						<a {...(mailto ? { href: `mailto:${email}` } : {})}>
							({email})
						</a>
					</>
				)}
			</div>
			<div>{description}</div>
		</div>
	</div>
);

export const GroupMember = ({
	attributes,
}: {
	attributes: Attributes;
}): JSX.Element => {
	const [user, setUser] = useState<User>(null);
	useEffect(() => {
		apiFetch({
			path: `/ftek/v1/group/user?email=${attributes.email}`,
		}).then(setUser);
	}, [attributes.wordpress_user && attributes.email]);

	if (attributes.wordpress_user) {
		if (!user) {
			return <GroupMember.Loading />;
		}

		if (!user.found) {
			return (
				<GroupMemberDisplay
					email={__('user@ftek.se', 'ftek.se')}
					mailto={false}
					post={attributes.post}
					firstName={__('Firstname', 'ftek')}
					lastName={__('Lastname', 'ftek')}
					description={__('User not found', 'ftek')}
				/>
			);
		}

		return (
			<GroupMemberDisplay
				email={attributes.email}
				post={attributes.post}
				firstName={user.first_name}
				lastName={user.last_name}
				nickName={attributes.nick_name}
				description={attributes.description}
				picture={user.picture}
			/>
		);
	}

	return (
		<GroupMemberDisplay
			email={attributes.email}
			post={attributes.post}
			firstName={attributes.first_name}
			lastName={attributes.last_name}
			nickName={attributes.nick_name}
			description={attributes.description}
			picture={attributes.picture}
		/>
	);
};

GroupMember.Loading = (): JSX.Element => (
	<GroupMemberDisplay
		email={__('user@ftek.se', 'ftek')}
		mailto={false}
		post={__('Post', 'ftek')}
		firstName={__('Firstname', 'ftek')}
		lastName={__('Lastname', 'ftek')}
		nickName={__('Nickname', 'ftek')}
		description={__('Loading member…', 'ftek')}
	/>
);
