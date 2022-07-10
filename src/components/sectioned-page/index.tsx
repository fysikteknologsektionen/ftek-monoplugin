const Main = ({ children }: { children: React.ReactNode }) => (
	<div className="ftek-plugin-sectioned-page-main">{children}</div>
);

const Aside = ({ children }: { children: React.ReactNode }) => (
	<aside className="ftek-plugin-sectioned-page-aside">{children}</aside>
);

const SectionedPage = ({
	children,
}: {
	children: [
		React.ReactElement<typeof Main>,
		React.ReactElement<typeof Aside>
	];
}): JSX.Element => <div className="ftek-plugin-sectioned-page">{children}</div>;

SectionedPage.Main = Main;
SectionedPage.Aside = Aside;

export default SectionedPage;
