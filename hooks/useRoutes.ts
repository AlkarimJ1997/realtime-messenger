import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { HiChat } from 'react-icons/hi';
import { HiArrowLeftOnRectangle, HiUsers } from 'react-icons/hi2';
import useConversation from '@/hooks/useConversation';

const useRoutes = () => {
	const pathname = usePathname();
	const { conversationId } = useConversation();

	const routes = useMemo(() => {
		return [
			{
				label: 'Chat',
				href: '/conversations',
				icon: HiChat,
				active: pathname === '/conversations' || !!conversationId,
			},
			{
				label: 'Users',
				href: '/users',
				icon: HiUsers,
				active: pathname === '/users',
			},
			{
				label: 'Logout',
				href: '#',
				icon: HiArrowLeftOnRectangle,
				onClick: () => signOut(),
			},
		];
	}, [pathname, conversationId]);

	return routes;
};

export default useRoutes;
