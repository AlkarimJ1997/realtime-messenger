import { NextResponse } from 'next/server';
import getCurrentUser from '@/actions/getCurrentUser';
import prisma from '@/lib/prisma';

type Body = {
	name: string;
	image: string;
};

export async function POST(request: Request) {
	try {
		const currentUser = await getCurrentUser();
		const { name, image } = (await request.json()) as Body;

		if (!currentUser?.id) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: currentUser.id,
			},
			data: {
				name,
				image,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.log(error, 'ERROR_SETTINGS');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
