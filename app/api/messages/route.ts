import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';
import { lastFromArr } from '@/utils';

type Body = {
	message: string;
	image: string;
	conversationId: string;
};

export async function POST(request: Request) {
	try {
		const currentUser = await getCurrentUser();
		const { message, image, conversationId } = (await request.json()) as Body;

		if (!currentUser?.id || !currentUser?.email) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const newMessage = await prisma.message.create({
			data: {
				body: message,
				image: image,
				conversation: {
					connect: {
						id: conversationId,
					},
				},
				sender: {
					connect: {
						id: currentUser.id,
					},
				},
				seen: {
					connect: {
						id: currentUser.id,
					},
				},
			},
			include: {
				sender: true,
				seen: true,
			},
		});

		const updatedConversation = await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageAt: new Date(),
				messages: {
					connect: {
						id: newMessage.id,
					},
				},
			},
			include: {
				users: true,
				messages: {
					include: {
						seen: true,
					},
				},
			},
		});

    // For the chat body
		await pusherServer.trigger(conversationId, 'messages:new', newMessage);

		const lastMessage = lastFromArr(updatedConversation.messages);

    // For the sidebar
		updatedConversation.users.map(user => {
			pusherServer.trigger(user.email!, 'conversation:update', {
				id: conversationId,
				messages: [lastMessage],
			});
		});

		return NextResponse.json(newMessage);
	} catch (error) {
		console.log(error, 'ERROR_MESSAGES');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
