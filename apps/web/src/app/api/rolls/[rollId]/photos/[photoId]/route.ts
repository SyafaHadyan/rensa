import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
  BackendError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import { photoIdParamDto, rollIdParamDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
  POST /api/rolls/[rollId]/photos/[photo_id]
*/
export async function POST(
  _req: Request,
  context: { params: Promise<{ rollId: string; photo_id: string }> },
) {
  try {
    const rawParams = await context.params;
    const { roll_id } = rollIdParamDto.parse(rawParams);
    const { photo_id } = photoIdParamDto.parse(rawParams);
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const modifiedCount = await rollService.addPhotoToRoll(
      roll_id,
      photo_id,
      actor_id,
    );

    return NextResponse.json({
      success: true,
      message: "Photo added to selected roll",
      modifiedCount,
    });
  } catch (error) {
    return mapRouteError(error, "Failed to add photo to roll");
  }
}

/*
  DELETE /api/rolls/[rollId]/photos/[photo_id]
*/
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ rollId: string; photo_id: string }> },
) {
  try {
    const rawParams = await context.params;
    const { roll_id } = rollIdParamDto.parse(rawParams);
    const { photo_id } = photoIdParamDto.parse(rawParams);
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    await rollService.removePhotoFromRoll(roll_id, photo_id, actor_id);

    return NextResponse.json({
      success: true,
      message: "Photo removed from roll",
    });
  } catch (error) {
    return mapRouteError(error, "Failed to remove photo from roll");
  }
}

function mapRouteError(error: unknown, fallbackMessage: string): NextResponse {
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
    { success: false, message: fallbackMessage },
    { status: 500 },
  );
}
