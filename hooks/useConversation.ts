import { useMemo } from 'react';
import { useParams } from 'next/navigation';

const useConversation = () => {
	const params = useParams();

	const conversationId = useMemo(() => {
		return params?.conversationId ?? '';
	}, [params]);

	const isOpen = useMemo(() => {
		return !!conversationId;
	}, [conversationId]);

	return useMemo(() => {
		return {
			isOpen,
			conversationId,
		};
	}, [isOpen, conversationId]);
};

export default useConversation;