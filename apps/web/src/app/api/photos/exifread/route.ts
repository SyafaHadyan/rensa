import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { expressApi } from "@/lib/axios-server";

export async function POST(req: Request) {
	const incomingFormData = await req.formData();
	const file = incomingFormData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json(
			{ success: false, message: "No file provided" },
			{ status: 400 }
		);
	}

	const formData = new FormData();
	formData.append("file", file, file.name);

	try {
		const res = await expressApi.post("/exifread", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		console.log("EXIF read response:", res.data.data.metadata);
		return NextResponse.json(
			{
				success: true,
				data: res.data.data.metadata,
				message: "EXIF detection success",
			},
			{ status: 200 }
		);
	} catch (error) {
		if (isAxiosError(error)) {
			return NextResponse.json(
				{
					success: false,
					message:
						error.response?.data?.message ||
						error.message ||
						"EXIF detection failed",
					upstreamStatus: error.response?.status,
				},
				{ status: error.response?.status ?? 502 }
			);
		}

		return NextResponse.json(
			{ success: false, message: "EXIF detection failed" },
			{ status: 500 }
		);
	}
}
