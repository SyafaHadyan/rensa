export interface EditableProfile {
	avatarUrl?: string;
	email?: string;
	id: string;
	username: string;
}

export interface UpdatedProfile {
	avatarUrl?: string;
	email?: string;
	userId: string;
	username: string;
}
