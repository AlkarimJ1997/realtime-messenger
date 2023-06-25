'use client';

import Modal from '@/components/Modal';
import Image from 'next/image';

interface ImageModalProps {
	src?: string | null;
	isOpen?: boolean;
	onClose: () => void;
}

const ImageModal = ({ src, isOpen, onClose }: ImageModalProps) => {
	if (!src) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className='h-80 w-80'>
				<Image fill src={src} alt='Image' className='object-cover' />
			</div>
		</Modal>
	);
};

export default ImageModal;
