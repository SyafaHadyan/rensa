import { ContactRepository } from "@rensa/db/queries/contact.repository";
import type {
	ContactRepositoryInterface,
	CreateContactDto,
	ListContactsQueryDto,
} from "@rensa/db/schema";
import { EMAIL_JOB_NAMES, enqueueEmailJob } from "@rensa/queue";
import { contactFormLimiter } from "@rensa/rate-limit";
import {
	TooManyRequestsError,
	UnauthorizedError,
} from "@/backend/common/backend.error";
import type {
	ContactListResult,
	ContactSubmitResult,
} from "@/backend/types/service.types";
import { sanitizeInput } from "@/lib/validation";

export class ContactService {
	readonly contactRepository: ContactRepositoryInterface;

	constructor(contactRepository: ContactRepositoryInterface) {
		this.contactRepository = contactRepository;
	}

	async submit(
		payload: CreateContactDto,
		context: {
			ipAddress: string;
			userAgent: string;
		}
	): Promise<ContactSubmitResult> {
		const { success } = await contactFormLimiter.limit(context.ipAddress);
		if (!success) {
			throw new TooManyRequestsError(
				"Too many requests. Please try again later."
			);
		}

		const contact = await this.contactRepository.create({
			name: sanitizeInput(payload.name),
			email: sanitizeInput(payload.email).toLowerCase(),
			subject: sanitizeInput(payload.subject),
			message: sanitizeInput(payload.message),
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
		});

		await this.enqueueContactEmails(contact).catch((error) => {
			console.error("Failed to queue contact emails:", error);
			return;
		});

		return { id: contact.contactId };
	}

	async list(
		query: ListContactsQueryDto,
		actorRole?: string
	): Promise<ContactListResult> {
		if (actorRole !== "admin") {
			throw new UnauthorizedError();
		}

		const { contacts, total } = await this.contactRepository.list(query);
		return {
			contacts,
			pagination: {
				page: query.page,
				limit: query.limit,
				total,
				pages: Math.ceil(total / query.limit),
			},
		};
	}

	private async enqueueContactEmails(contact: {
		contactId: string;
		email: string;
		message: string;
		name: string;
		subject: string;
	}): Promise<void> {
		await Promise.all([
			enqueueEmailJob(EMAIL_JOB_NAMES.sendContactAdmin, contact),
			enqueueEmailJob(EMAIL_JOB_NAMES.sendContactConfirmation, contact),
		]);
	}
}

export const contactService = new ContactService(new ContactRepository());
