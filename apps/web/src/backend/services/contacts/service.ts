import type {
  ContactRepositoryInterface,
  CreateContactDto,
  ListContactsQueryDto,
} from "@rensa/db/schema";
import { contactFormLimiter } from "@rensa/rate-limit";
import {
  TooManyRequestsError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import ContactAdminEmail from "@/frontend/components/emailTemplates/ContactAdminEmail";
import ContactConfirmationEmail from "@/frontend/components/emailTemplates/ContactConfirmationEmail";
import getResend from "@/lib/resend";
import { sanitizeInput } from "@/lib/validation";

export interface ContactSubmitResult {
  id: string;
}

export interface ContactListResult {
  contacts: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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
    },
  ): Promise<ContactSubmitResult> {
    const { success } = await contactFormLimiter.limit(context.ipAddress);
    if (!success) {
      throw new TooManyRequestsError(
        "Too many requests. Please try again later.",
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

    await this.sendContactEmails(contact).catch(() => {
      return;
    });

    return { id: contact._id };
  }

  async list(
    query: ListContactsQueryDto,
    actorRole?: string,
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

  private async sendContactEmails(contact: {
    email: string;
    message: string;
    name: string;
    subject: string;
  }): Promise<void> {
    const resend = await getResend();
    await resend.emails.send({
      from: process.env.CONTACT_NOTIFICATION_EMAIL || "",
      to: process.env.ADMIN_EMAIL || "",
      subject: contact.subject,
      react: ContactAdminEmail({
        senderEmail: contact.email,
        senderName: contact.name,
        subject: contact.subject,
        message: contact.message,
      }),
    });

    await resend.emails.send({
      from: process.env.NO_REPLY_EMAIL || "",
      to: contact.email,
      subject: `New Contact Form Submission: ${contact.subject}`,
      react: ContactConfirmationEmail({
        name: contact.name,
        subject: contact.subject,
      }),
    });
  }
}
