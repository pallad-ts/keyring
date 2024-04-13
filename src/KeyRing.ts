import { Key, KeyInput, KeySchema } from "./Key";
import { KeyId, KeyIdInput, KeyIdSchema } from "./KeyId";
import { createAssertion } from "@pallad/assert-helper";
import { ERRORS } from "./errors";
import { Range, enchant } from "@pallad/range";

export class KeyRing {
	#keys = new Map<KeyId, Key>();

	#options: KeyRing.Options;
	#availableForRandomPick = new Set<string>();

	constructor(options: KeyRing.Options = {}) {
		this.#options = options;
	}

	assertKeyById = createAssertion(
		(id: KeyIdInput) => {
			return this.getKeyById(id);
		},
		id => {
			return ERRORS.NO_SUCH_KEY.create(id);
		}
	);

	assertEntryById = createAssertion(
		(id: KeyIdInput) => {
			return this.getKeyEntryById(id);
		},
		id => {
			return ERRORS.NO_SUCH_KEY.create(id);
		}
	);

	/**
	 * Prevent key from being picked randomly
	 *
	 * It is useful to sometimes maintain the key in keyring
	 * (for example for decrypting legacy data) but not using it for new use cases
	 */
	preventRandomPick(keyId: string): this {
		if (!this.#availableForRandomPick.has(keyId)) {
			throw ERRORS.NO_SUCH_KEY.create(keyId);
		}
		this.#availableForRandomPick.delete(keyId);
		return this;
	}

	/**
	 * Add key to key ring
	 *
	 * Throws an error if key with the same id already exists to prevent accidental override
	 */
	addKey(keyId: KeyIdInput, key: KeyInput): this {
		if (this.#keys.has(keyId)) {
			throw ERRORS.KEY_ALREADY_EXISTS.create(keyId);
		}
		const validatedKey = KeySchema.parse(key);
		validateKeySize(validatedKey, this.#options);
		this.#keys.set(KeyIdSchema.parse(keyId), validatedKey);
		this.#availableForRandomPick.add(keyId);
		return this;
	}

	removeKey(keyId: KeyIdInput): this {
		this.#keys.delete(KeyIdSchema.parse(keyId));
		this.#availableForRandomPick.delete(keyId);
		return this;
	}

	/**
	 * Returns random key from key ring
	 *
	 * Throws an error if key ring is empty
	 */
	getRandomKey(): KeyRing.Entry {
		if (this.#availableForRandomPick.size === 0) {
			throw ERRORS.NO_AVAILABLE_KEYS_IN_KEY_RING.create();
		}

		const entries = Array.from(this.#availableForRandomPick);
		const keyId = entries[Math.floor(Math.random() * entries.length)];
		return this.getKeyEntryById(keyId)!;
	}

	getKeyById(keyIdInput: KeyIdInput): Key | undefined {
		return this.getKeyEntryById(keyIdInput)?.key;
	}

	getKeyEntryById(keyIdInput: KeyIdInput): KeyRing.Entry | undefined {
		const keyId = KeyIdSchema.parse(keyIdInput);
		const key = this.#keys.get(keyId);
		if (key) {
			return { id: keyId, key };
		}
	}
}

export namespace KeyRing {
	export interface Entry {
		id: KeyId;
		key: Key;
	}

	export interface Options {
		keySize?: Range<number>;
	}
}

function validateKeySize(key: Key, options: KeyRing.Options) {
	if (options.keySize) {
		const keySize = key.getValue().length;
		if (!Range.isWithin(options.keySize, keySize, true)) {
			throw ERRORS.INVALID_KEY_SIZE.create(options.keySize, keySize);
		}
	}
}
