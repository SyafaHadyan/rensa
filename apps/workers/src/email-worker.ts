import {
	sendBugReportConfirmationEmail,
	sendBugReportTeamEmail,
	sendContactAdminEmail,
	sendContactConfirmationEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "@rensa/email";
import { EMAIL_JOB_NAMES, type EmailJobPayloadByName } from "@rensa/queue";

type EmailJob =
	| {
			name: typeof EMAIL_JOB_NAMES.sendVerification;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendVerification];
	  }
	| {
			name: typeof EMAIL_JOB_NAMES.sendPasswordReset;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendPasswordReset];
	  }
	| {
			name: typeof EMAIL_JOB_NAMES.sendContactAdmin;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendContactAdmin];
	  }
	| {
			name: typeof EMAIL_JOB_NAMES.sendContactConfirmation;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendContactConfirmation];
	  }
	| {
			name: typeof EMAIL_JOB_NAMES.sendBugReportTeam;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendBugReportTeam];
	  }
	| {
			name: typeof EMAIL_JOB_NAMES.sendBugReportConfirmation;
			payload: EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendBugReportConfirmation];
	  };

export const dispatchEmailJob = (
	name: EmailJob["name"],
	payload: EmailJob["payload"]
) => {
	switch (name) {
		case EMAIL_JOB_NAMES.sendVerification:
			return sendVerificationEmail(
				(
					payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendVerification]
				).email
			);
		case EMAIL_JOB_NAMES.sendPasswordReset:
			return sendPasswordResetEmail(
				(
					payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendPasswordReset]
				).email
			);
		case EMAIL_JOB_NAMES.sendContactAdmin:
			return sendContactAdminEmail(
				payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendContactAdmin]
			);
		case EMAIL_JOB_NAMES.sendContactConfirmation:
			return sendContactConfirmationEmail(
				payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendContactConfirmation]
			);
		case EMAIL_JOB_NAMES.sendBugReportTeam:
			return sendBugReportTeamEmail(
				payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendBugReportTeam]
			);
		case EMAIL_JOB_NAMES.sendBugReportConfirmation:
			return sendBugReportConfirmationEmail(
				payload as EmailJobPayloadByName[typeof EMAIL_JOB_NAMES.sendBugReportConfirmation]
			);
		default:
			throw new Error(`Unsupported email job: ${name}`);
	}
};
