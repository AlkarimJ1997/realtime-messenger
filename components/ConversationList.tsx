'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { FullConversationType } from '@/types';
import { MdOutlineGroupAdd } from 'react-icons/md';
import useConversation from '@/hooks/useConversation';
import clsx from 'clsx';
import ConversationBox from '@/components/ConversationBox';
import GroupChatModal from '@/components/GroupChatModal';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';

interface ConversationListProps {
	users: User[];
	initialChats: FullConversationType[];
}

const ConversationList = ({ users, initialChats }: ConversationListProps) => {
	const [chats, setChats] = useState<FullConversationType[]>(initialChats);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const session = useSession();
	const router = useRouter();
	const { conversationId, isOpen } = useConversation();

	const pusherKey = useMemo(() => {
		return session?.data?.user?.email;
	}, [session?.data?.user?.email]);

	useEffect(() => {
		if (!pusherKey) return;

		const newHandler = (conversation: FullConversationType) => {
			setChats(currentChats => {
				if (find(currentChats, { id: conversation.id })) return currentChats;

				return [...currentChats, conversation];
			});
		};

		const updateHandler = (conversation: FullConversationType) => {
			setChats(currentChats => {
				return currentChats.map(chat => {
					if (chat.id === conversation.id) {
						return {
							...chat,
							messages: conversation.messages,
						};
					}

					return chat;
				});
			});
		};

		const deleteHandler = (conversation: FullConversationType) => {
			setChats(currentChats => {
				return currentChats.filter(chat => chat.id !== conversation.id);
			});

			if (conversationId === conversation.id) {
				router.push('/conversations');
			}
		};

		pusherClient.subscribe(pusherKey);
		pusherClient.bind('conversation:new', newHandler);
		pusherClient.bind('conversation:update', updateHandler);
		pusherClient.bind('conversation:remove', deleteHandler);

		return () => {
			pusherClient.unsubscribe(pusherKey);
			pusherClient.unbind('conversation:new', newHandler);
			pusherClient.unbind('conversation:update', updateHandler);
			pusherClient.unbind('conversation:remove', deleteHandler);
		};
	}, [pusherKey, conversationId, router]);

	return (
		<>
			<GroupChatModal
				users={users}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
			<aside
				className={clsx(
					'fixed inset-y-0 overflow-y-auto border-r border-gray-200 pb-20 lg:left-20 lg:block lg:w-80 lg:pb-0',
					isOpen ? 'hidden' : 'left-0 block w-full'
				)}>
				<div className='px-5'>
					<div className='mb-4 flex justify-between pt-4'>
						<div className='text-2xl font-bold text-neutral-800'>Messages</div>
						<div
							onClick={() => setIsModalOpen(true)}
							className='cursor-pointer rounded-full bg-gray-100 p-2 text-gray-600 transition hover:opacity-75'>
							<MdOutlineGroupAdd size={20} />
						</div>
					</div>
					{chats.map(chat => (
						<ConversationBox
							key={chat.id}
							data={chat}
							selected={conversationId === chat.id}
						/>
					))}
				</div>
			</aside>
		</>
	);
};

export default ConversationList;
