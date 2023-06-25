import { useState } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { CldUploadButton } from 'next-cloudinary';
import axios from 'axios';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Image from 'next/image';
import Button from '@/components/Button';

interface SettingsModalProps {
	currentUser: User;
	isOpen?: boolean;
	onClose: () => void;
}

const SettingsModal = ({
	currentUser,
	isOpen,
	onClose,
}: SettingsModalProps) => {
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
			name: currentUser?.name,
			image: currentUser?.image,
		},
	});

	const image = watch('image');

	const handleUpload = (result: any) => {
		setValue('image', result?.info?.secure_url, {
			shouldValidate: true,
		});
	};

	const onSubmit: SubmitHandler<FieldValues> = data => {
		setIsLoading(true);

		axios
			.post('/api/settings', data)
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
							Profile
						</h2>
						<p className='mt-2 text-sm leading-6 text-gray-600'>
							Edit your public information.
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
							<div>
								<label className='block text-sm font-medium leading-6 text-gray-900'>
									Photo
								</label>
								<div className='mt-2 flex items-center gap-x-3'>
									<Image
										src={
											image || currentUser?.image || '/images/placeholder.jpg'
										}
										alt='Avatar'
										width={48}
										height={48}
										className='rounded-full'
									/>
									<CldUploadButton
										options={{ maxFiles: 1 }}
										onUpload={handleUpload}
										uploadPreset='ix1gkmfe'>
										<Button type='button' disabled={isLoading} secondary>
											Change
										</Button>
									</CldUploadButton>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-6 flex items-center justify-end gap-x-6'>
						<Button disabled={isLoading} onClick={onClose} secondary>
							Cancel
						</Button>
						<Button type='submit' disabled={isLoading}>
							Save
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default SettingsModal;
