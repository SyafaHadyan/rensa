import { and, count, desc, eq, type SQL } from "drizzle-orm";
import {
  type BugReportSeverity,
  type BugReportStatus,
  bugReports,
  type CreateBugReportDto,
  type CreatedBugReportDto,
  type ListBugReportsQueryDto,
  type ListBugReportsResult,
} from "../schemas/bug-reports";
import db from "../src/db";

export class BugReportRepository {
  async create(payload: CreateBugReportDto): Promise<CreatedBugReportDto> {
    const [bugReport] = await db
      .insert(bugReports)
      .values({
        actualBehavior: payload.actualBehavior ?? null,
        description: payload.description,
        email: payload.email,
        expectedBehavior: payload.expectedBehavior ?? null,
        ipAddress: payload.ipAddress,
        severity: payload.severity,
        steps: payload.steps ?? null,
        title: payload.title,
        userAgent: payload.userAgent,
      })
      .returning({
        bugReportId: bugReports.bugReportId,
        created_at: bugReports.created_at,
        email: bugReports.email,
        title: bugReports.title,
      });

    if (!bugReport) {
      throw new Error("Failed to save bug report");
    }

    return bugReport;
  }

  async list(query: ListBugReportsQueryDto): Promise<ListBugReportsResult> {
    const descending = query.sortBy.startsWith("-");
    const sortField = descending ? query.sortBy.slice(1) : query.sortBy;
    const from = (query.page - 1) * query.limit;
    let whereClause: SQL<unknown> | undefined;

    if (query.status) {
      whereClause = eq(bugReports.status, query.status as BugReportStatus);
    }
    if (query.severity) {
      const severityWhere = eq(
        bugReports.severity,
        query.severity as BugReportSeverity,
      );
      whereClause = whereClause
        ? and(whereClause, severityWhere)
        : severityWhere;
    }

    const orderByClause =
      sortField === "updated_at"
        ? descending
          ? desc(bugReports.updated_at)
          : bugReports.updated_at
        : descending
          ? desc(bugReports.created_at)
          : bugReports.created_at;

    const data = await db
      .select()
      .from(bugReports)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(query.limit)
      .offset(from);
    const [countRow] = await db
      .select({ total: count() })
      .from(bugReports)
      .where(whereClause);

    return {
      data,
      total: Number(countRow?.total ?? 0),
    };
  }
}
