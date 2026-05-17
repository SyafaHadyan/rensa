import { BugReportRepository } from "@rensa/db/queries/bug-report.repository";
import type { BugReportSeverity, BugReportStatus } from "@rensa/db/schema";
import { bugReportLimiter } from "@rensa/rate-limit";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BugReportConfirmationEmail } from "@/frontend/components/emailTemplates/BugReportConfirmationEmail";
import { BugReportTeamEmail } from "@/frontend/components/emailTemplates/BugReportTeamEmail";
import { authOptions } from "@/lib/auth";
import getResend from "@/lib/resend";
import { validateBugReportData } from "@/lib/validation";

const bugReportRepository = new BugReportRepository();

/**
 * POST /api/bug-reports
 * Submit a bug report
 */
export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { success } = await bugReportLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "You've submitted too many bug reports. Please try again in 24 hours.",
      },
      { status: 429 },
    );
  }

  const {
    title,
    email,
    description,
    stepsToReproduce,
    actualBehavior,
    expectedBehavior,
  } = await req.json();

  const validation = validateBugReportData({
    title,
    email,
    description,
    stepsToReproduce,
    expectedBehavior,
    actualBehavior,
  });
  if (!validation.isValid) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  let severity: BugReportSeverity = "medium";
  const validatedTitle = validation.data.title;
  const validatedEmail = validation.data.email;
  const validatedDescription = validation.data.description;
  const validatedSteps = validation.data.stepsToReproduce;
  const validatedActual = validation.data.actualBehavior;
  const validatedExpected = validation.data.expectedBehavior;
  const reportText = (
    validatedTitle +
    " " +
    validatedDescription
  ).toLowerCase();

  const criticalKeywords = [
    "crash",
    "broken",
    "can't",
    "cannot",
    "not working",
    "data loss",
  ];
  const highKeywords = ["error", "bug", "issue", "fail", "slow"];

  if (criticalKeywords.some((keyword) => reportText.includes(keyword))) {
    severity = "critical";
  } else if (highKeywords.some((keyword) => reportText.includes(keyword))) {
    severity = "high";
  }

  let bugReport;
  try {
    bugReport = await bugReportRepository.create({
      actualBehavior: validatedActual ?? null,
      description: validatedDescription,
      email: validatedEmail,
      expectedBehavior: validatedExpected ?? null,
      ipAddress: ip,
      severity,
      steps: validatedSteps ?? null,
      title: validatedTitle,
      userAgent: req.headers.get("user-agent") || "",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: {
          database: "Failed to save bug report",
        },
      },
      { status: 400 },
    );
  }

  const reportId = bugReport.bugReportId;

  try {
    const resend = await getResend();
    await resend.emails.send({
      from: "bug_reports@rensa.site",
      to: process.env.DEV_TEAM_EMAIL || process.env.ADMIN_EMAIL || "",
      subject: `New Bug Report: ${bugReport.title}`,
      react: BugReportTeamEmail({
        title: validatedTitle,
        email: validatedEmail,
        description: validatedDescription,
        stepsToReproduce: validatedSteps,
        actualBehavior: validatedActual,
        expectedBehavior: validatedExpected,
        severity,
        reportId,
        submittedAt:
          bugReport.created_at?.toISOString() ?? new Date().toISOString(),
      }),
    });
    await resend.emails.send({
      from: process.env.NO_REPLY_EMAIL || "",
      to: bugReport.email,
      subject: `Bug Report Received: ${bugReport.title}`,
      react: BugReportConfirmationEmail({
        title: bugReport.title,
        reportId,
      }),
    });
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reporting this bug! We appreciate your help.",
        data: {
          id: reportId,
          severity,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error sending bug report to team:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "There was an error processing your bug report. Please try again later.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/bug-reports
 * Retrieve bug reports (admin only)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as BugReportStatus | null;
    const severity = searchParams.get("severity") as BugReportSeverity | null;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "-created_at";
    const validStatuses: BugReportStatus[] = [
      "new",
      "investigating",
      "acknowledged",
      "resolved",
      "closed",
    ];
    const validSeverities: BugReportSeverity[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    const { data, total } = await bugReportRepository.list({
      limit,
      page,
      severity:
        severity && validSeverities.includes(severity) ? severity : undefined,
      sortBy,
      status: status && validStatuses.includes(status) ? status : undefined,
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Bug Report GET API Error]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve bug reports",
      },
      { status: 500 },
    );
  }
}
