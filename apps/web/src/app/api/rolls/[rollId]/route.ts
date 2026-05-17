import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
  BackendError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import { rollIdParamDto, rollUpdateDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
    GET /api/rolls/[rollId]
*/
export async function GET(
  _req: Request,
  context: { params: Promise<{ rollId: string }> },
) {
  try {
    const params = rollIdParamDto.parse(await context.params);
    const roll = await rollService.getById(params.roll_id);
    return NextResponse.json(
      { success: true, message: "Fetched roll successfully", data: roll },
      { status: 200 },
    );
  } catch (error) {
    return mapRouteError(error, "Failed to fetch roll");
  }
}

/*
  PATCH /api/rolls/[rollId]
*/
export async function PATCH(
  req: Request,
  context: { params: Promise<{ rollId: string }> },
) {
  try {
    const params = rollIdParamDto.parse(await context.params);
    const body = rollUpdateDto.parse(await req.json());
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const updatedRoll = await rollService.update(
      params.roll_id,
      body,
      actor_id,
    );
    return NextResponse.json(
      {
        success: true,
        message: "Roll updated successfully",
        data: updatedRoll,
      },
      { status: 200 },
    );
  } catch (error) {
    return mapRouteError(error, "Failed to update roll");
  }
}

/*
  DELETE /api/rolls/[rollId]
*/
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ rollId: string }> },
) {
  try {
    const params = rollIdParamDto.parse(await context.params);
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const deletedRoll = await rollService.deleteById(params.roll_id, actor_id);
    return NextResponse.json(
      {
        success: true,
        message: "Roll deleted successfully",
        data: deletedRoll,
      },
      { status: 200 },
    );
  } catch (error) {
    return mapRouteError(error, "Failed to delete roll");
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
