import { NextResponse } from 'next/server';
import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

type Member = {
	value: string;
};

type Body = {
	userId: string;
	isGroup: boolean;
	members: Member[];
	name: string;
};

export async function POST(request: Request) {
	try {
		const currentUser = await getCurrentUser();
		const { userId, isGroup, members, name } = (await request.json()) as Body;

		// If user is not logged in, return unauthorized
		if (!currentUser?.id || !currentUser?.email) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		// If user isn't providing correct data for a group, return bad request
		if (isGroup && (!members || members.length < 2 || !name)) {
			return new NextResponse('Invalid data provided', { status: 400 });
		}

		// Create a new group conversation (doesn't matter if one already exists)
		if (isGroup) {
			const newGroupConversation = await prisma.conversation.create({
				data: {
					name,
					isGroup,
					users: {
						connect: [
							...members.map(member => ({
								id: member.value,
							})),
							{ id: currentUser.id },
						],
					},
				},
				include: {
					users: true,
				},
			});

			newGroupConversation.users.forEach(user => {
				if (!user.email) return;

				pusherServer.trigger(
					user.email,
					'conversation:new',
					newGroupConversation
				);
			});

			return NextResponse.json(newGroupConversation);
		}

		// If user is trying to chat one on one, return the existing conversation
		const existingConversation = await prisma.conversation.findMany({
			where: {
				OR: [
					{
						userIds: {
							equals: [currentUser.id, userId],
						},
					},
					{
						userIds: {
							equals: [userId, currentUser.id],
						},
					},
				],
			},
		});

		if (existingConversation[0]) {
			return NextResponse.json(existingConversation[0]);
		}

		// Create a new conversation if one doesn't exist
		const newConversation = await prisma.conversation.create({
			data: {
				users: {
					connect: [{ id: currentUser.id }, { id: userId }],
				},
			},
			include: {
				users: true,
			},
		});

		newConversation.users.forEach(user => {
			if (!user.email) return;

			pusherServer.trigger(user.email, 'conversation:new', newConversation);
		});

		return NextResponse.json(newConversation);
	} catch (error) {
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
