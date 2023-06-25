'use client';

import { useState, useRef, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';
import { FullMessageType } from '@/types';
import axios from 'axios';
import useConversation from '@/hooks/useConversation';
import MessageBox from '@/components/chat/MessageBox';

interface BodyProps {
	initialMessages: FullMessageType[];
}

const Body = ({ initialMessages }: BodyProps) => {
	const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
	const { conversationId } = useConversation();
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		axios.post(`/api/conversations/${conversationId}/seen`);
	}, [conversationId]);

	useEffect(() => {
		pusherClient.subscribe(conversationId);
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

		const messageHandler = (message: FullMessageType) => {
			axios.post(`/api/conversations/${conversationId}/seen`);

			setMessages(currentMessages => {
				if (find(currentMessages, { id: message.id })) return currentMessages;

				return [...currentMessages, message];
			});

			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		};

		const updateMessageHandler = (newMessage: FullMessageType) => {
			setMessages(currentMessages => {
				return currentMessages.map(currentMessage => {
					if (currentMessage.id === newMessage.id) return newMessage;

					return currentMessage;
				});
			});
		};

		pusherClient.bind('messages:new', messageHandler);
		pusherClient.bind('message:update', updateMessageHandler);

		return () => {
			pusherClient.unsubscribe(conversationId);
			pusherClient.unbind('messages:new', messageHandler);
			pusherClient.unbind('message:update', updateMessageHandler);
		};
	}, [conversationId]);

	return (
		<div className='flex-1 overflow-y-auto'>
			{messages.map((message, i) => (
				<MessageBox
					key={message.id}
					data={message}
					isLast={i === messages.length - 1}
				/>
			))}
			<div ref={bottomRef} className='pt-24' />
		</div>
	);
};

export default Body;
