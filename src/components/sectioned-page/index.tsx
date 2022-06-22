const Main = ({ children }: { children: React.ReactNode }) => (
	<div>{children}</div>
);

const Aside = ({ children }: { children: React.ReactNode }) => (
	<aside>{children}</aside>
);

const SectionedPage = ({
	children,
}: {
	children: [
		React.ReactElement<typeof Main>,
		React.ReactElement<typeof Aside>
	];
}): JSX.Element => <div>{children}</div>;

SectionedPage.Main = Main;
SectionedPage.Aside = Aside;

export default SectionedPage;
