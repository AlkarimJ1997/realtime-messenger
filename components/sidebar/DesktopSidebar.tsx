'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import useRoutes from '@/hooks/useRoutes';
import DesktopItem from '@/components/sidebar/DesktopItem';
import Avatar from '@/components/Avatar';
import SettingsModal from '@/components/sidebar/SettingsModal';

interface DesktopSidebarProps {
	currentUser: User;
}

const DesktopSidebar = ({ currentUser }: DesktopSidebarProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const routes = useRoutes();

	return (
		<>
			<SettingsModal
				currentUser={currentUser}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
			<div className='hidden justify-between lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-20 lg:flex-col lg:overflow-y-auto lg:border-r-[1px] lg:bg-white lg:pb-4 xl:px-6'>
				<nav className='mt-4 flex flex-col justify-between'>
					<ul role='list' className='flex flex-col items-center space-y-1'>
						{routes.map(route => (
							<DesktopItem
								key={route.label}
								href={route.href}
								label={route.label}
								icon={route.icon}
								active={route.active}
								onClick={route.onClick}
							/>
						))}
					</ul>
				</nav>
				<nav className='mt-4 flex flex-col items-center justify-between'>
					<div
						onClick={() => setIsOpen(true)}
						className='cursor-pointer transition hover:opacity-75'>
						<Avatar user={currentUser} />
					</div>
				</nav>
			</div>
		</>
	);
};

export default DesktopSidebar;
