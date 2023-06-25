'use client';

import { useState, useMemo } from 'react';
import { Conversation, User } from '@prisma/client';
import { HiChevronLeft, HiEllipsisHorizontal } from 'react-icons/hi2';
import useOtherUser from '@/hooks/useOtherUser';
import useActiveList from '@/hooks/useActiveList';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import ProfileDrawer from '@/components/chat/ProfileDrawer';
import AvatarGroup from '@/components/AvatarGroup';

interface HeaderProps {
	conversation: Conversation & {
		users: User[];
	};
}

const Header = ({ conversation }: HeaderProps) => {
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const otherUser = useOtherUser(conversation);

  const { members } = useActiveList();
	const isActive = members.indexOf(otherUser?.email!) !== -1;

	const statusText = useMemo(() => {
		if (conversation.isGroup) {
			return `${conversation.users.length} members`;
		}

		return isActive ? 'Active' : 'Offline';
	}, [conversation, isActive]);

	return (
		<>
			<ProfileDrawer
				data={conversation}
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			/>
			<div className='flex w-full items-center justify-between border-b-[1px] bg-white px-4 py-3 shadow-sm sm:px-4 lg:px-6'>
				<div className='flex items-center gap-3'>
					<Link
						href='/conversations'
						className='block cursor-pointer text-sky-500 transition hover:text-sky-600 lg:hidden'>
						<HiChevronLeft size={32} />
					</Link>
					{conversation.isGroup ? (
						<AvatarGroup users={conversation.users} />
					) : (
						<Avatar user={otherUser} />
					)}
					<div className='flex flex-col'>
						<div>{conversation.name || otherUser.name}</div>
						<div className='text-sm font-light text-neutral-500'>
							{statusText}
						</div>
					</div>
				</div>

				<HiEllipsisHorizontal
					size={32}
					onClick={() => setDrawerOpen(true)}
					className='cursor-pointer text-sky-500 transition hover:text-sky-600'
				/>
			</div>
		</>
	);
};

export default Header;
