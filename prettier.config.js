/** @type {import('prettier').Config} */
module.exports = {
	...require('@wordpress/prettier-config'),
	overrides: [
		{
			files: '*.{yml,yaml}',
			options: {
				tabWidth: 2,
			},
		},
		{
			files: '*.scss',
			options: {
				singleQuote: false,
			},
		},
	],
};
