import { NextResponse } from 'next/server';
import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

interface IParams {
	conversationId: string;
}

type Params = {
	params: IParams;
};

export async function DELETE(request: Request, { params }: Params) {
	try {
		const currentUser = await getCurrentUser();
		const { conversationId } = params;

		if (!currentUser?.id) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const existingConversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				users: true,
			},
		});

		if (!existingConversation) {
			return new NextResponse('Invalid ID', { status: 400 });
		}

		const deletedConversation = await prisma.conversation.deleteMany({
			where: {
				id: conversationId,
				userIds: {
					hasSome: [currentUser.id],
				},
			},
		});

		existingConversation.users.forEach(user => {
			if (!user.email) return;

			pusherServer.trigger(
				user.email,
				'conversation:remove',
				existingConversation
			);
		});

		return NextResponse.json(deletedConversation);
	} catch (error) {
		console.log(error, 'ERROR_CONVERSATION_DELETE');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
