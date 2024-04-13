import { KeyRing } from "@src/KeyRing";
import "@pallad/errors-dev";
import { ERRORS } from "@src/errors";

describe("KeyRing", () => {
	describe("validating key size", () => {
		const BUFFER_VALID = Buffer.alloc(100);
		const BUFFER_INVALID = Buffer.alloc(200);

		describe("start range", () => {
			const keyRing = new KeyRing({
				keySize: {
					start: 50,
				},
			});

			it("valid", () => {
				keyRing.addKey("key", BUFFER_VALID);
				expect(keyRing.getKeyById("key")).not.toBeUndefined();
			});

			it("invalid", () => {
				expect(() => {
					keyRing.addKey("key_invalid", Buffer.alloc(50));
				}).toThrowErrorWithCode(ERRORS.INVALID_KEY_SIZE);
			});
		});

		describe("end range", () => {
			const keyRing = new KeyRing({
				keySize: {
					end: 150,
				},
			});

			it("valid", () => {
				keyRing.addKey("key", BUFFER_VALID);
				expect(keyRing.getKeyById("key")).not.toBeUndefined();
			});

			it("invalid", () => {
				expect(() => {
					keyRing.addKey("key_invalid", BUFFER_INVALID);
				}).toThrowErrorWithCode(ERRORS.INVALID_KEY_SIZE);
			});
		});

		describe("start and end range", () => {
			const keyRing = new KeyRing({
				keySize: {
					start: 50,
					end: 150,
				},
			});

			it("valid", () => {
				keyRing.addKey("key", BUFFER_VALID);
				expect(keyRing.getKeyById("key")).not.toBeUndefined();
			});

			it("invalid", () => {
				expect(() => {
					keyRing.addKey("key_invalid", BUFFER_INVALID);
				}).toThrowErrorWithCode(ERRORS.INVALID_KEY_SIZE);
			});
		});
	});
});
