import getUsers from '@/actions/getUsers';
import Sidebar from '@/components/sidebar/Sidebar';
import UserList from '@/components/UserList';

export default async function UsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
  const users = await getUsers();

	return (
		// @ts-expect-error Async Server Component
		<Sidebar>
			<div className='h-full'>
        <UserList users={users} />
        {children}
      </div>
		</Sidebar>
	);
}
