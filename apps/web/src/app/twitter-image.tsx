import { ImageResponse } from "next/og";
import { RensaSocialImage } from "./social-image";

export const runtime = "edge";

export const alt = "Rensa - Photography Community";
export const size = {
	width: 1200,
	height: 675,
};

export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(<RensaSocialImage format="twitter" />, {
		...size,
	});
}
