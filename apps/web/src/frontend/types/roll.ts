export interface Roll {
	createdAt?: string;
	imageUrl?: string;
	name: string;
	photos?: string[];
	previewPhotos?: string[];
	rollId: string;
	userId?: string;
}

export interface ApiRoll {
	imageUrl?: string;
	name: string;
	rollId?: string;
}

export interface SelectedRoll {
	name: string;
	rollId: string;
}

export interface RollsState {
	clearRolls: () => void;
	createRoll: (newRoll: { imageUrl?: string; name: string }) => Promise<void>;
	fetchRolls: () => Promise<void>;
	isLoading: boolean;
	rolls: Roll[];
}
