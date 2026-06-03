import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";
import type React from "react";

const baseUrl = "https://rensa.site";

interface EmailTemplateProps {
	children: React.ReactNode;
	preview: string;
}

export const EmailTemplate = ({ children, preview }: EmailTemplateProps) => (
	<Html>
		<Head />
		<Preview>{preview}</Preview>
		<Body
			style={{ backgroundColor: "#f6f7f9", fontFamily: "Arial, sans-serif" }}
		>
			<Container
				style={{
					backgroundColor: "#ffffff",
					border: "1px solid #e5e7eb",
					margin: "32px auto",
					padding: "32px",
					width: "560px",
				}}
			>
				{children}
				<Text style={{ color: "#6b7280", fontSize: "12px" }}>
					Rensa, {baseUrl}
				</Text>
			</Container>
		</Body>
	</Html>
);

const Shell = ({
	children,
	preview,
}: {
	children: React.ReactNode;
	preview: string;
}) => <EmailTemplate preview={preview}>{children}</EmailTemplate>;

export const EmailVerificationTemplate = ({
	verificationLink,
}: {
	verificationLink: string;
}) => (
	<Shell preview="Verify your Rensa email address">
		<Heading>Verify your email</Heading>
		<Text>Confirm your email address to finish setting up your account.</Text>
		<Button href={verificationLink}>Verify email</Button>
	</Shell>
);

export const PasswordResetEmail = ({ resetLink }: { resetLink: string }) => (
	<Shell preview="Reset your Rensa password">
		<Heading>Reset your password</Heading>
		<Text>Use this secure link to choose a new password.</Text>
		<Button href={resetLink}>Reset password</Button>
	</Shell>
);

export const ContactAdminEmail = ({
	message,
	senderEmail,
	senderName,
	subject,
}: {
	message: string;
	senderEmail: string;
	senderName: string;
	subject: string;
}) => (
	<Shell preview={`New contact form submission: ${subject}`}>
		<Heading>{subject}</Heading>
		<Text>
			{senderName} ({senderEmail}) sent a contact form message.
		</Text>
		<Text>{message}</Text>
	</Shell>
);

export const ContactConfirmationEmail = ({
	name,
	subject,
}: {
	name: string;
	subject: string;
}) => (
	<Shell preview="We received your message">
		<Heading>Thanks, {name}</Heading>
		<Text>
			We received your message about "{subject}" and will follow up soon.
		</Text>
	</Shell>
);

export const BugReportTeamEmail = ({
	actualBehavior,
	description,
	email,
	expectedBehavior,
	reportId,
	severity,
	stepsToReproduce,
	submittedAt,
	title,
}: {
	actualBehavior?: string | null;
	description: string;
	email: string;
	expectedBehavior?: string | null;
	reportId: string;
	severity: string;
	stepsToReproduce?: string | null;
	submittedAt: string;
	title: string;
}) => (
	<Shell preview={`New ${severity} bug report: ${title}`}>
		<Heading>{title}</Heading>
		<Text>Report ID: {reportId}</Text>
		<Text>Submitted by: {email}</Text>
		<Text>Severity: {severity}</Text>
		<Text>Submitted at: {submittedAt}</Text>
		<Text>{description}</Text>
		{stepsToReproduce ? <Text>Steps: {stepsToReproduce}</Text> : null}
		{actualBehavior ? <Text>Actual: {actualBehavior}</Text> : null}
		{expectedBehavior ? <Text>Expected: {expectedBehavior}</Text> : null}
	</Shell>
);

export const BugReportConfirmationEmail = ({
	reportId,
	title,
}: {
	reportId: string;
	title: string;
}) => (
	<Shell preview="Bug report received">
		<Heading>Bug report received</Heading>
		<Text>
			Thanks for reporting "{title}". Your report ID is {reportId}.
		</Text>
	</Shell>
);
