import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contactStatusEnum } from "./enums";

export const contacts = pgTable(
	"contacts",
	{
		contactId: uuid("contact_id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		subject: text("subject").notNull(),
		message: text("message").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		status: contactStatusEnum("status").default("new"),
		respondedAt: timestamp("responded_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [index("idx_contacts_email").on(table.email)]
);

interface Passthrough {
	[key: string]: unknown;
}

export type ContactStatus = "new" | "read" | "responded";

export interface ContactResponseDto extends Passthrough {
	contactId: string;
	createdAt?: string;
	email: string;
	ipAddress: string;
	message: string;
	name: string;
	respondedAt?: string;
	status: ContactStatus;
	subject: string;
	updatedAt?: string;
	userAgent?: string;
}

export interface CreateContactDto {
	email: string;
	message: string;
	name: string;
	subject: string;
}

export interface ListContactsQueryDto {
	limit: number;
	page: number;
	status: ContactStatus;
}

export interface ListContactsResult {
	contacts: ContactResponseDto[];
	total: number;
}

export interface ContactRepositoryInterface {
	create(params: {
		email: string;
		ipAddress: string;
		message: string;
		name: string;
		subject: string;
		userAgent: string;
	}): Promise<ContactResponseDto>;
	list(query: ListContactsQueryDto): Promise<ListContactsResult>;
}
