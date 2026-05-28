import cors from "cors";
import debug from "debug";
import dotenv from "dotenv";
import { exiftool } from "exiftool-vendored";
import express from "express";
import multer from "multer";
import readerRoutes from "./routes/reader.js";

const envPath =
	process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
dotenv.config({ path: envPath });
debug.enable(process.env.DEBUG || "rensa:*");

const log = debug("rensa:server");
const logRequest = debug("rensa:request");
const logError = debug("rensa:error");

const app = express();

log("Initializing Rensa Express server...");

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);
log("CORS enabled for origin: %s", process.env.CORS_ORIGIN);

app.disable("x-powered-by");
app.use((_req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "no-referrer");
	next();
});

// Request logging middleware
app.use((req, res, next) => {
	const start = Date.now();
	logRequest("→ %s %s from %s", req.method, req.url, req.ip);

	res.on("finish", () => {
		const duration = Date.now() - start;
		logRequest(
			"← %s %s %d (%dms)",
			req.method,
			req.url,
			res.statusCode,
			duration
		);
	});

	next();
});

app.get("/health", (_req, res) => {
	log("Health check requested");
	res.json({ status: "ok" });
});

// Routes
app.use("/api", readerRoutes);

// Multer error handler (global)
app.use((error, _req, res, _next) => {
	if (error instanceof multer.MulterError) {
		logError("Multer error: %s (code: %s)", error.message, error.code);
		if (error.code === "LIMIT_FILE_SIZE") {
			return res
				.status(413)
				.json({ error: "File too large. Maximum size is 50MB." });
		}
	}
	if (error.message === "Only JPEG files are allowed!") {
		logError("File type error: Only JPEG files are allowed");
		return res.status(415).json({ error: "Only JPEG files are allowed!" });
	}
	logError("Unexpected error: %O", error);
	res.status(500).json({ error: "An unexpected error occurred." });
});

process.on("exit", () => {
	console.log("Closing exiftool...");
	exiftool.end();
});

// app.listen(PORT, () => {
// 	console.log("Server running at http://localhost:%d", PORT);
// 	log("Server listening on port %d", PORT);
// 	log("Debug logs enabled. Set DEBUG=rensa:* to see all logs");
// });
app.listen(3003, "0.0.0.0", () => {
	console.log("Server running at http://localhost:%d", 3003);
	log("🎧 Server listening on port %d", 3003);
	log("🔍 Debug logs enabled. Set DEBUG=rensa:* to see all logs");
});
