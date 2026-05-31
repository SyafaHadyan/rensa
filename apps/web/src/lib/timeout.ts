export class TimeoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TimeoutError";
	}
}

export function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	message = `Operation timed out after ${ms}ms`
): Promise<T> {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeout = setTimeout(() => reject(new TimeoutError(message)), ms);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		if (timeout) {
			clearTimeout(timeout);
		}
	});
}
