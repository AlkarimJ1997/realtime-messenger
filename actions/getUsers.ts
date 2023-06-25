import prisma from '@/lib/prisma';
import getSession from '@/actions/getSession';

const getUsers = async () => {
	const session = await getSession();

	if (!session?.user?.email) return [];

	try {
		const users = await prisma.user.findMany({
			where: {
				email: {
					not: session.user.email,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return users;
	} catch (error) {
		return [];
	}
};

export default getUsers;
