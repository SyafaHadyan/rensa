import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BackendError } from "@/backend/common/backend.error";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
    GET /api/rolls/default
*/
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    const defaultRoll = await rollService.getDefaultByUserId(actor_id);
    return NextResponse.json(
      {
        success: true,
        message: "Fetched default roll successfully",
        data: defaultRoll,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch default roll",
      },
      { status: 500 },
    );
  }
}
