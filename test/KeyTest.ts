import { KeySchema } from "@src/Key";
import { Secret, secret } from "@pallad/secret";

function assertKey(value: unknown, expected: unknown) {
	const result = KeySchema.parse(value);
	expect(Secret.is(result)).toBe(true);
	expect(result.getValue()).toEqual(expected);
}

describe("Key", () => {
	const BUFFER = Buffer.from("test", "utf8");

	it("should be a buffer", () => {
		assertKey(KeySchema.parse(BUFFER), BUFFER);
	});

	it("should be a secret", () => {
		const hex = "b088e7ec4a6cc7b218851bd91c4b1033";
		const value = secret(hex);
		assertKey(KeySchema.parse(value), Buffer.from(hex, "hex"));
	});

	it("hex like string gets converted to buffer", () => {
		const hex = "b088e7ec4a6cc7b218851bd91c4b1033";
		const buffer = Buffer.from(hex, "hex");
		assertKey(KeySchema.parse(hex), buffer);
	});

	describe("fails", () => {
		it("for null or undefined", () => {
			// eslint-disable-next-line no-null/no-null
			expect(() => KeySchema.parse(null)).toThrowErrorMatchingSnapshot();
			expect(() => KeySchema.parse(undefined)).toThrowErrorMatchingSnapshot();
		});

		it("for non hex string", () => {
			expect(() => KeySchema.parse("test")).toThrowErrorMatchingSnapshot();
		});
	});
});
