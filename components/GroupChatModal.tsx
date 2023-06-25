'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';

interface GroupChatModalProps {
	users: User[];
	isOpen?: boolean;
	onClose: () => void;
}

const GroupChatModal = ({ users, isOpen, onClose }: GroupChatModalProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			name: '',
			members: [],
		},
	});

	const members = watch('members');

	const onSubmit: SubmitHandler<FieldValues> = data => {
		setIsLoading(true);

		axios
			.post('/api/conversations', {
				...data,
				isGroup: true,
			})
			.then(() => {
				router.refresh();
				onClose();
			})
			.catch(() => toast.error('Something went wrong!'))
			.finally(() => setIsLoading(false));
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='space-y-12'>
					<div className='border-b border-gray-900/10 pb-12'>
						<h2 className='text-base font-semibold leading-7 text-gray-900'>
							Create a group chat
						</h2>
						<p className='mt-1 text-sm leading-6 text-gray-600'>
							Create a chat with more than 2 people.
						</p>
						<div className='mt-10 flex flex-col gap-y-8'>
							<Input
								id='name'
								label='Name'
								disabled={isLoading}
								register={register}
								errors={errors}
								required
							/>
							<Select
								label='Members'
								disabled={isLoading}
								value={members}
								options={users.map(user => ({
									value: user.id,
									label: user.name,
								}))}
								onChange={value =>
									setValue('members', value, {
										shouldValidate: true,
									})
								}
							/>
						</div>
					</div>
				</div>

				<div className='mt-6 flex items-center justify-end gap-x-6'>
					<Button
						type='button'
						disabled={isLoading}
						onClick={onClose}
						secondary>
						Cancel
					</Button>
					<Button type='submit' disabled={isLoading}>
						Create
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default GroupChatModal;
