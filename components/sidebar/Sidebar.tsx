import getCurrentUser from '@/actions/getCurrentUser';
import DesktopSidebar from '@/components/sidebar/DesktopSidebar';
import MobileFooter from '@/components/sidebar/MobileFooter';

interface SidebarProps {
	children: React.ReactNode;
}

const Sidebar = async ({ children }: SidebarProps) => {
	const currentUser = await getCurrentUser();

	return (
		<div className='h-full'>
			<DesktopSidebar currentUser={currentUser!} />
			<MobileFooter />
			<main className='h-full lg:pl-20'>{children}</main>
		</div>
	);
};

export default Sidebar;
