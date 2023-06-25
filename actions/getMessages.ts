import prisma from '@/lib/prisma';

const getMessages = async (conversationId: string) => {
	try {
		const messages = await prisma.message.findMany({
			where: {
				conversationId,
			},
			include: {
				sender: true,
				seen: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
		});

		return messages;
	} catch (error) {
		return null;
	}
};

export default getMessages;
