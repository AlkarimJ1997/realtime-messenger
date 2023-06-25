import getConversationById from '@/actions/getConversationById';
import getMessages from '@/actions/getMessages';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/chat/Header';
import Body from '@/components/chat/Body';
import Form from '@/components/chat/Form';

interface IParams {
	conversationId: string;
}

interface ConversationIdProps {
	params: IParams;
}

const ConversationId = async ({ params }: ConversationIdProps) => {
	const conversation = await getConversationById(params.conversationId);
	const messages = await getMessages(params.conversationId);

	if (!conversation) {
		return (
			<div className='h-full lg:pl-80'>
				<div className='flex h-full flex-col'>
					<EmptyState />
				</div>
			</div>
		);
	}

	return (
		<div className='h-full lg:pl-80'>
			<div className='flex h-full flex-col'>
				<Header conversation={conversation} />
				<Body initialMessages={messages!} />
				<Form />
			</div>
		</div>
	);
};

export default ConversationId;
