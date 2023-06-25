'use client';

import MobileItem from '@/components/sidebar/MobileItem';
import useConversation from '@/hooks/useConversation';
import useRoutes from '@/hooks/useRoutes';

const MobileFooter = () => {
	const routes = useRoutes();
	const { isOpen } = useConversation();

	if (isOpen) {
		return null;
	}

	return (
		<div className='fixed bottom-0 z-40 flex w-full items-center justify-between border-t-[1px] bg-white lg:hidden'>
			{routes.map(route => (
				<MobileItem
					key={route.label}
					href={route.href}
					icon={route.icon}
					active={route.active}
					onClick={route.onClick}
				/>
			))}
		</div>
	);
};

export default MobileFooter;
