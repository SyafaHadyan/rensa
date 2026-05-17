import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { bugSeverityEnum, bugStatusEnum } from "./enums";

export const bugReports = pgTable(
  "bug_reports",
  {
    bugReportId: uuid("bug_report_id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    email: text("email").notNull(),
    description: text("description").notNull(),
    steps: text("steps"),
    expectedBehavior: text("expected_behavior"),
    actualBehavior: text("actual_behavior"),
    browser: text("browser"),
    attachments: text("attachments"),
    severity: bugSeverityEnum("severity").default("medium"),
    status: bugStatusEnum("status").default("new"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_bug_reports_email").on(table.email)],
);

export type BugReportSeverity = "low" | "medium" | "high" | "critical";
export type BugReportStatus =
  | "new"
  | "investigating"
  | "acknowledged"
  | "resolved"
  | "closed";

export interface CreateBugReportDto {
  actualBehavior?: string | null;
  description: string;
  email: string;
  expectedBehavior?: string | null;
  ipAddress: string;
  severity: BugReportSeverity;
  steps?: string | null;
  title: string;
  userAgent: string;
}

export interface CreatedBugReportDto {
  bugReportId: string;
  created_at?: Date | null;
  email: string;
  title: string;
}

export interface ListBugReportsQueryDto {
  limit: number;
  page: number;
  severity?: BugReportSeverity;
  sortBy: string;
  status?: BugReportStatus;
}

export interface ListBugReportsResult {
  data: Array<typeof bugReports.$inferSelect>;
  total: number;
}
