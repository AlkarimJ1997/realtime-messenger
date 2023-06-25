import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';

const getConversations = async () => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) return [];

	try {
		const conversations = await prisma.conversation.findMany({
			where: {
				userIds: {
					has: currentUser.id,
				},
			},
			include: {
				users: true,
				messages: {
					include: {
						sender: true,
						seen: true,
					},
				},
			},
			orderBy: {
				lastMessageAt: 'desc',
			},
		});

		return conversations;
	} catch (error) {
		return [];
	}
};

export default getConversations;
