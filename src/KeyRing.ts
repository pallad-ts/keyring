import { Key, KeyInput, KeySchema } from "./Key";
import { KeyId, KeyIdInput, KeyIdSchema } from "./KeyId";
import { createAssertion } from "@pallad/assert-helper";
import { ERRORS } from "./errors";
import { Range } from "@pallad/range";
import { Either, left, right } from "@sweet-monads/either";
import { KeyRingError } from "./KeyRingError";

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
		const finalKeyId = KeyIdSchema.parse(keyId);
		if (!this.#availableForRandomPick.has(finalKeyId)) {
			throw ERRORS.NO_SUCH_KEY.create(finalKeyId);
		}
		this.#availableForRandomPick.delete(finalKeyId);
		return this;
	}

	/**
	 * Add key to key ring
	 *
	 * Throws an error if key with the same id already exists to prevent accidental override
	 */
	addKey(keyId: KeyIdInput, key: KeyInput): this {
		const validatedKey = KeySchema.parse(key);
		const validatedKeyId = KeyIdSchema.parse(keyId);

		const entry = validateKeyEntry({ id: validatedKeyId, key: validatedKey }, this.#options);
		if (entry.isLeft()) {
			throw entry.value;
		}

		const finalEntry = entry.unwrap();
		if (this.#keys.has(finalEntry.id)) {
			throw ERRORS.KEY_ALREADY_EXISTS.create(finalEntry.id);
		}

		this.#keys.set(finalEntry.id, finalEntry.key);
		this.#availableForRandomPick.add(validatedKeyId);
		return this;
	}

	removeKey(keyId: KeyIdInput): this {
		const finalKeyId = KeyIdSchema.parse(keyId);
		this.#keys.delete(finalKeyId);
		this.#availableForRandomPick.delete(finalKeyId);
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
		/**
		 * Key size constraint
		 */
		keySize?: Range<number>;

		/**
		 * Custom key entry validation
		 * Uses returned right value as a key entry
		 */
		validation?: (key: KeyRing.Entry) => Either<string, KeyRing.Entry>;
	}
}

function validateKeyEntry(entry: KeyRing.Entry, options: KeyRing.Options): Either<KeyRingError, KeyRing.Entry> {
	if (options.keySize) {
		const keySize = entry.key.getValue().length;
		if (!Range.isWithin(options.keySize, keySize, true)) {
			return left(ERRORS.INVALID_KEY_SIZE.create(options.keySize, keySize));
		}
	}

	if (options.validation) {
		return options.validation(entry).mapLeft(message => ERRORS.CUSTOM_VALIDATION_VIOLATED.create(message));
	}

	return right(entry);
}
