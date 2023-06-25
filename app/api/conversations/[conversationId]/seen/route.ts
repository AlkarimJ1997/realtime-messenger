import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { lastFromArr } from '@/utils';
import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';

interface IParams {
	conversationId: string;
}

type Params = {
	params: IParams;
};

export async function POST(request: Request, { params }: Params) {
	try {
		const currentUser = await getCurrentUser();
		const { conversationId } = params;

		if (!currentUser?.id || !currentUser?.email) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		// Find the existing conversation
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				messages: {
					include: {
						seen: true,
					},
				},
				users: true,
			},
		});

		if (!conversation) {
			return new NextResponse('Invalid ID', { status: 400 });
		}

		const lastMessage = lastFromArr(conversation.messages);

		if (!lastMessage) {
			return NextResponse.json(conversation);
		}

		// Update seen of the last message
		const updatedMessage = await prisma.message.update({
			where: {
				id: lastMessage.id,
			},
			data: {
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

		await pusherServer.trigger(currentUser.email, 'conversation:update', {
			id: conversationId,
			messages: [updatedMessage],
		});

		// If the user has already seen the message, return the message
		if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
			return NextResponse.json(updatedMessage);
		}

		// Alert the other users that the message has been seen
		await pusherServer.trigger(
			conversationId,
			'message:update',
			updatedMessage
		);

		return NextResponse.json(updatedMessage);
	} catch (error) {
		console.log(error, 'ERROR_MESSAGES_SEEN');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
