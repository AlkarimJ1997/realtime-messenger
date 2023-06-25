'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { BsGithub, BsGoogle } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Input from '@/components/Input';
import Button from '@/components/Button';
import AuthSocialButton from '@/components/auth/AuthSocialButton';

const Variants = {
	LOGIN: 'LOGIN',
	REGISTER: 'REGISTER',
} as const;

const SocialActions = {
	GITHUB: 'github',
	GOOGLE: 'google',
} as const;

type Variant = keyof typeof Variants;
type SocialAction = (typeof SocialActions)[keyof typeof SocialActions];

const AuthForm = () => {
	const session = useSession();
	const router = useRouter();
	const [variant, setVariant] = useState<Variant>('LOGIN');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (session?.status === 'authenticated') {
			router.push('/users');
		}
	}, [session?.status, router]);

	// Hooks
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	});

	const toggleVariant = useCallback(() => {
		if (variant === Variants.LOGIN) {
			setVariant(Variants.REGISTER);
			return;
		}

		setVariant(Variants.LOGIN);
	}, [variant]);

	const onSubmit: SubmitHandler<FieldValues> = data => {
		setIsLoading(true);

		if (variant === 'REGISTER') {
			axios
				.post('/api/register', data)
				.then(() => signIn('credentials', data))
				.catch(() => toast.error('Something went wrong!'))
				.finally(() => setIsLoading(false));
		}

		if (variant === 'LOGIN') {
			signIn('credentials', {
				...data,
				redirect: false,
			})
				.then(callback => {
					if (callback?.error) {
						toast.error(callback.error);
					}

					if (callback?.ok && !callback?.error) {
						toast.success('Logged in successfully!');
						router.push('/users');
					}
				})
				.finally(() => setIsLoading(false));
		}
	};

	const socialAction = (action: SocialAction) => {
		setIsLoading(true);

		signIn(action, { redirect: false })
			.then(callback => {
				if (callback?.error) {
					toast.error(callback.error);
				}

				if (callback?.ok && !callback?.error) {
					toast.success('Logged in successfully!');
				}
			})
			.finally(() => setIsLoading(false));
	};

	return (
		<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
			<div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
				<form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
					{variant === Variants.REGISTER && (
						<Input id='name' label='Name' register={register} errors={errors} />
					)}
					<Input
						id='email'
						label='Email address'
						type='email'
						register={register}
						errors={errors}
						disabled={isLoading}
					/>
					<Input
						id='password'
						label='Password'
						type='password'
						register={register}
						errors={errors}
						disabled={isLoading}
					/>
					<div>
						<Button type='submit' disabled={isLoading} fullWidth>
							{variant === Variants.LOGIN ? 'Sign In' : 'Register'}
						</Button>
					</div>
				</form>

				<div className='mt-6'>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-300' />
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='bg-white px-2 text-gray-500'>
								Or continue with
							</span>
						</div>
					</div>

					<div className='mt-6 flex gap-2'>
						<AuthSocialButton
							icon={BsGithub}
							onClick={() => socialAction(SocialActions.GITHUB)}
						/>
						<AuthSocialButton
							icon={BsGoogle}
							onClick={() => socialAction(SocialActions.GOOGLE)}
						/>
					</div>
				</div>

				<div className='mt-6 flex justify-center gap-2 px-2 text-sm text-gray-500'>
					<div>
						{variant === Variants.LOGIN
							? 'New to Messenger?'
							: 'Already have an account?'}
					</div>
					<div onClick={toggleVariant} className='cursor-pointer underline'>
						{variant === Variants.LOGIN ? 'Create an account' : 'Login'}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthForm;
