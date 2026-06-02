import { Writable } from "node:stream";
import { cloudinary } from "@rensa/cloudinary";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const uploadResult = {
	bytes: 12_345,
	created_at: "2026-01-02T03:04:05.000Z",
	format: "jpg",
	height: 900,
	public_id: "user_uploads/user-1/ready-photo",
	secure_url: "https://res.cloudinary.com/rensa/image/upload/ready-photo.jpg",
	width: 1200,
};

const uploadStreamMock = vi.hoisted(() => vi.fn());
const destroyMock = vi.hoisted(() => vi.fn());
const sharpMock = vi.hoisted(() => vi.fn());

vi.mock("@rensa/cloudinary", () => ({
	cloudinary: {
		uploader: {
			destroy: destroyMock,
			upload_stream: uploadStreamMock,
		},
	},
}));

vi.mock("sharp", () => ({
	default: sharpMock,
}));

const payload = {
	originalFilename: "photo.jpg",
	photoId: "photo-1",
	sourcePublicId: "staged/photo-1",
	sourceUrl: "https://staged.test/photo.jpg",
	userId: "user-1",
};

type PhotoWorkerRepository = NonNullable<
	Parameters<typeof import("./photo-worker").processPhotoUpload>[1]
>;

const createRepository = () =>
	({
		markProcessingFailed: vi.fn().mockResolvedValue(undefined),
		markProcessingReady: vi.fn().mockResolvedValue(undefined),
	}) as {
		markProcessingFailed: ReturnType<typeof vi.fn>;
		markProcessingReady: ReturnType<typeof vi.fn>;
	} & PhotoWorkerRepository;

const createSharpChain = (buffer: Buffer) => ({
	jpeg: vi.fn().mockReturnThis(),
	resize: vi.fn().mockReturnThis(),
	rotate: vi.fn().mockReturnThis(),
	toBuffer: vi.fn().mockResolvedValue(buffer),
});

describe("processPhotoUpload", () => {
	beforeEach(() => {
		vi.resetModules();
		process.env.FAST_API_BASE_URL = "http://ai.test/api";
		destroyMock.mockResolvedValue({ result: "ok" });
		sharpMock
			.mockReturnValueOnce(createSharpChain(Buffer.from("moderation-image")))
			.mockReturnValueOnce(createSharpChain(Buffer.from("optimized-image")));
		uploadStreamMock.mockImplementation((_options, callback) => {
			const stream = new Writable({
				write(_chunk, _encoding, done) {
					done();
				},
			});
			stream.on("finish", () => callback(undefined, uploadResult));
			return stream;
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
		delete process.env.FAST_API_BASE_URL;
	});

	it("moderates, uploads, marks the photo ready, and removes staging", async () => {
		const repository = createRepository();
		const sourceBuffer = Buffer.from("original-image");
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				arrayBuffer: () => Promise.resolve(sourceBuffer.buffer),
				ok: true,
			})
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ label: "SFW", score: 0.1 }),
				ok: true,
			});
		vi.stubGlobal("fetch", fetchMock);
		const { processPhotoUpload } = await import("./photo-worker");

		await processPhotoUpload(payload, repository);

		expect(fetchMock).toHaveBeenNthCalledWith(1, payload.sourceUrl);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"http://ai.test/api/nsfw/predict",
			expect.objectContaining({ method: "POST" })
		);
		expect(sharp).toHaveBeenCalledTimes(2);
		expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
			expect.objectContaining({
				folder: "user_uploads/user-1",
				resource_type: "image",
				transformation: [{ crop: "limit", width: 2000 }],
			}),
			expect.any(Function)
		);
		expect(repository.markProcessingReady).toHaveBeenCalledWith("photo-1", {
			format: "jpg",
			height: 900,
			publicId: "user_uploads/user-1/ready-photo",
			size: 12_345,
			uploadedAt: new Date("2026-01-02T03:04:05.000Z"),
			url: "https://res.cloudinary.com/rensa/image/upload/ready-photo.jpg",
			width: 1200,
		});
		expect(repository.markProcessingFailed).not.toHaveBeenCalled();
		expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("staged/photo-1");
	});

	it("marks permanent moderation failures and removes staging", async () => {
		const repository = createRepository();
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce({
					arrayBuffer: () => Promise.resolve(Buffer.from("original").buffer),
					ok: true,
				})
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ label: "NSFW", score: 0.9 }),
					ok: true,
				})
		);
		const { processPhotoUpload } = await import("./photo-worker");

		await processPhotoUpload(payload, repository);

		expect(repository.markProcessingFailed).toHaveBeenCalledWith(
			"photo-1",
			"Image failed moderation."
		);
		expect(repository.markProcessingReady).not.toHaveBeenCalled();
		expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
		expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("staged/photo-1");
	});
});
