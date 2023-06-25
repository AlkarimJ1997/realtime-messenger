import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { FullConversationType } from '@/types';
import { User } from '@prisma/client';

type UsersInChat = {
	users: User[];
};

const useOtherUser = (conversation: FullConversationType | UsersInChat) => {
	const session = useSession();

	const otherUser = useMemo(() => {
		const currentUserEmail = session?.data?.user?.email;

		return conversation.users.filter(user => {
			return user.email !== currentUserEmail;
		});
	}, [session?.data?.user?.email, conversation.users]);

	return otherUser[0];
};

export default useOtherUser;
