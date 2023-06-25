import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Body = {
	email: string;
	name: string;
	password: string;
};

export const POST = async (request: Request) => {
	try {
		const { email, name, password } = (await request.json()) as Body;

		if (!email || !name || !password) {
			return new NextResponse('Missing parameters', { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: {
				email,
				name,
				hashedPassword,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.log(error, 'REGISTRATION_ERROR');
		return new NextResponse('Internal Server Error', { status: 500 });
	}
};
