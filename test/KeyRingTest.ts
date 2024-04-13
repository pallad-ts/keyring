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

	describe("picking random key", () => {
		let keyRing: KeyRing;

		const BUF_1 = Buffer.alloc(100);
		const BUF_2 = Buffer.alloc(101);
		const BUF_3 = Buffer.alloc(102);

		beforeEach(() => {
			keyRing = new KeyRing();

			keyRing.addKey("key1", BUF_1);
			keyRing.addKey("key2", BUF_2);
			keyRing.addKey("key3", BUF_3);
		});

		it("pick random key", () => {
			const key = keyRing.getRandomKey();
			expect(["key1", "key2", "key3"].includes(key.id)).toBe(true);
		});

		it("preventing key from being randomly picked", () => {
			keyRing.preventRandomPick("key1");
			for (let i = 0; i < 20; i++) {
				const key = keyRing.getRandomKey();
				expect(["key2", "key3"].includes(key.id)).toBe(true);
			}
		});

		it("fails to pick any kill when all disabled", () => {
			keyRing.preventRandomPick("key1");
			keyRing.preventRandomPick("key2");
			keyRing.preventRandomPick("key3");

			expect(() => {
				keyRing.getRandomKey();
			}).toThrowErrorWithCode(ERRORS.NO_AVAILABLE_KEYS_IN_KEY_RING);
		});
	});
});
