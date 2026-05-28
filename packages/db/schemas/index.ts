import {
	accounts as authAccounts,
	sessions as authSessions,
	users as authUsers,
	verificationTokens as authVerificationTokens,
} from "./auth";
import { bookmarks } from "./bookmarks";
import { bugReports } from "./bug-reports";
import { comments } from "./comments";
import { contacts } from "./contacts";
import {
	bugSeverityEnum,
	bugStatusEnum,
	contactStatusEnum,
	userRoleEnum,
} from "./enums";
import { notifications, notificationTypeEnum } from "./notifications";
import { photoMetadata, photos } from "./photos";
import { rollPhotos, rolls } from "./rolls";
import { users } from "./users";

export type * from "./bookmarks";
export type * from "./bug-reports";
export type * from "./comments";
export type * from "./contacts";
export type * from "./notifications";
export type * from "./photos";
export type * from "./rolls";
export type * from "./users";

export {
	authAccounts,
	authSessions,
	authUsers,
	authVerificationTokens,
	bookmarks,
	bugReports,
	bugSeverityEnum,
	bugStatusEnum,
	comments,
	contactStatusEnum,
	contacts,
	notifications,
	notificationTypeEnum,
	photoMetadata,
	photos,
	rollPhotos,
	rolls,
	userRoleEnum,
	users,
};

export const schema = {
	auth: {
		users: authUsers,
		sessions: authSessions,
		accounts: authAccounts,
		verificationTokens: authVerificationTokens,
	},
	core: {
		bookmarks,
		bugReports,
		comments,
		contacts,
		notifications,
		photos,
		rolls,
	},
	enums: {
		bugSeverityEnum,
		bugStatusEnum,
		userRoleEnum,
		contactStatusEnum,
		notificationTypeEnum,
	},
};
