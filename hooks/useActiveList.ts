import { create } from 'zustand';

interface ActiveListStore {
	members: string[];
	add: (id: string) => void;
	remove: (id: string) => void;
	set: (ids: string[]) => void;
}

const useActiveList = create<ActiveListStore>(set => {
	return {
		members: [],
		add: id => {
			return set(state => ({ members: [...state.members, id] }));
		},
		remove: id => {
			return set(state => ({
				members: state.members.filter(memberId => memberId !== id),
			}));
		},
		set: ids => set({ members: ids }),
	};
});

export default useActiveList;
