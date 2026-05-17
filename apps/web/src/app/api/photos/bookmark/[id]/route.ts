import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import {
  BackendError,
  UnauthorizedError,
} from "@/backend/common/backend.error";
import { bookmarkActionDto } from "@/backend/dtos/bookmark.dto";
import { photoIdParamDto } from "@/backend/dtos/photo.dto";
import { bookmarkService } from "@/backend/services/bookmarks/service";
import { authOptions } from "@/lib/auth";

/*
  POST /api/photos/bookmark/[id]
*/
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = photoIdParamDto.parse(await context.params);
    const body = bookmarkActionDto.parse(await request.json());
    const session = await getServerSession(authOptions);
    const actor_id = session?.user?.id;
    if (!actor_id) {
      throw new UnauthorizedError();
    }

    const result = await bookmarkService.updateBookmark({
      photo_id: params.id,
      user_id: body.user_id,
      action: body.action,
      actor_id: actor_id,
    });

    return NextResponse.json({
      success: true,
      bookmarks: result.bookmarks,
      is_bookmarked: result.is_bookmarked,
      message: "Bookmark updated",
    });
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
      { error: "Failed to update bookmark" },
      { status: 500 },
    );
  }
}
