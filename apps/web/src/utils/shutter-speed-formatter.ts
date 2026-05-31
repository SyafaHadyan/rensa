const SHUTTER_SPEED_DECIMAL_PATTERN =
	/^(\d+(?:\.\d+)?)(\s*(?:s|sec|secs|second|seconds))?$/i;
const MAX_DENOMINATOR = 64_000;

function approximateFraction(value: number) {
	if (!(Number.isFinite(value) && value > 0)) {
		return;
	}

	let lowerNumerator = 0;
	let lowerDenominator = 1;
	let upperNumerator = 1;
	let upperDenominator = 0;

	while (true) {
		const middleNumerator = lowerNumerator + upperNumerator;
		const middleDenominator = lowerDenominator + upperDenominator;

		if (middleDenominator > MAX_DENOMINATOR) {
			break;
		}

		if (middleNumerator / middleDenominator < value) {
			lowerNumerator = middleNumerator;
			lowerDenominator = middleDenominator;
		} else if (middleNumerator / middleDenominator > value) {
			upperNumerator = middleNumerator;
			upperDenominator = middleDenominator;
		} else {
			return `${middleNumerator}/${middleDenominator}`;
		}
	}

	const lowerValue = lowerNumerator / lowerDenominator;
	const upperValue = upperNumerator / upperDenominator;
	const [numerator, denominator] =
		value - lowerValue <= upperValue - value
			? [lowerNumerator, lowerDenominator]
			: [upperNumerator, upperDenominator];

	if (numerator === 0) {
		return `1/${Math.round(1 / value)}`;
	}

	return `${numerator}/${denominator}`;
}

export function formatShutterSpeed(value: unknown): unknown {
	if (typeof value === "number") {
		if (Number.isInteger(value)) {
			return value;
		}
		return approximateFraction(value) ?? value;
	}

	if (typeof value !== "string") {
		return value;
	}

	const normalizedValue = value.trim();
	const match = normalizedValue.match(SHUTTER_SPEED_DECIMAL_PATTERN);
	if (!match) {
		return normalizedValue;
	}

	const decimalValue = Number(match[1]);
	if (Number.isInteger(decimalValue)) {
		return normalizedValue;
	}

	const fraction = approximateFraction(decimalValue);
	if (!fraction) {
		return normalizedValue;
	}

	return `${fraction}${match[2]?.trim() ?? ""}`;
}
