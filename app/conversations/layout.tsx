import getConversations from '@/actions/getConversations';
import getUsers from '@/actions/getUsers';
import Sidebar from '@/components/sidebar/Sidebar';
import ConversationList from '@/components/ConversationList';

export default async function ConversationsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const conversations = await getConversations();
  const users = await getUsers();

	return (
		// @ts-expect-error Async Server Component
		<Sidebar>
			<div className='h-full'>
				<ConversationList users={users} initialChats={conversations} />
				{children}
			</div>
		</Sidebar>
	);
}
