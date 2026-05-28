interface CloudinaryImageOptions {
	crop?: "fill" | "fit" | "limit" | "scale";
	quality?: "auto" | number;
	width?: number;
}

export function getOptimizedCloudinaryImageUrl(
	url: string,
	options: CloudinaryImageOptions = {}
): string {
	if (!(url.includes("res.cloudinary.com") && url.includes("/upload/"))) {
		return url;
	}

	const transformations = [
		"f_auto",
		`q_${options.quality ?? "auto"}`,
		options.width ? `w_${options.width}` : null,
		options.crop ? `c_${options.crop}` : null,
	].filter(Boolean);

	if (transformations.length === 0 || url.includes("/upload/f_auto,")) {
		return url;
	}

	return url.replace("/upload/", `/upload/${transformations.join(",")}/`);
}
