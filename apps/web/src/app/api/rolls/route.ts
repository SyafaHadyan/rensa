import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
  BackendError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import { listRollsQueryDto, rollCreateDto } from "@/backend/dtos/roll.dto";
import { rollService } from "@/backend/services/rolls/service";
import { authOptions } from "@/lib/auth";

/*
  GET /api/rolls?user_id=...&sort=latest|oldest
*/
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = listRollsQueryDto.parse({
      user_id:
        searchParams.get("user_id") ?? searchParams.get("userId") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });
    const result = await rollService.listByUserId(query.user_id, query.sort);
    return NextResponse.json(
      {
        success: true,
        message: "Fetched rolls successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return mapRouteError(error, "Failed to fetch rolls");
  }
}

/*
  POST /api/rolls
*/
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const rawBody = (await req.json()) as {
      description?: string;
      image_url?: string;
      imageUrl?: string;
      name?: string;
      userId?: string;
      user_id?: string;
    };
    const body = rollCreateDto.parse({
      name: rawBody.name,
      description: rawBody.description,
      image_url: rawBody.image_url ?? rawBody.imageUrl,
      user_id: rawBody.user_id ?? rawBody.userId,
    });
    const createdRoll = await rollService.create(body, actor_id);
    return NextResponse.json(
      {
        success: true,
        message: "Roll created successfully",
        data: createdRoll,
      },
      { status: 201 },
    );
  } catch (error) {
    return mapRouteError(error, "Failed to create roll");
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
