import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { BackendError } from "@/backend/common/backend.error";
import { isSavedQueryDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
 * GET /api/rolls/is-saved?photo_id=<photo_id>
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const query = isSavedQueryDto.parse({
      photo_id: searchParams.get("photo_id") ?? undefined,
    });

    const result = await rollService.listContainingPhoto(
      query.photo_id,
      actor_id,
    );
    return NextResponse.json(
      {
        success: true,
        message: "Fetched saved rolls successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }
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
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
