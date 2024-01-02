import {Key, KeyInput, KeySchema} from "./Key";
import {KeyId, KeyIdInput, KeyIdSchema} from "./KeyId";
import {createAssertion} from "@pallad/assert-helper";
import {ERRORS} from "./errors";

export class KeyRing {
	#keys = new Map<KeyId, Key>();

	assertKeyById = createAssertion((id: KeyIdInput) => {
		return this.getKeyById(id);
	}, id => {
		return ERRORS.NO_SUCH_KEY.create(id);
	})

	assertEntryById = createAssertion((id: KeyIdInput) => {
		return this.getKeyEntryById(id);
	}, id => {
		return ERRORS.NO_SUCH_KEY.create(id)
	})

	/**
	 * Add key to key ring
	 *
	 * Throws an error if key with the same id already exists to prevent accidental override
	 */
	addKey(keyId: KeyIdInput, key: KeyInput): this {
		if (this.#keys.has(keyId)) {
			throw ERRORS.KEY_ALREADY_EXISTS.create(keyId);
		}
		this.#keys.set(KeyIdSchema.parse(keyId), KeySchema.parse(key));
		return this;
	}

	removeKey(keyId: KeyIdInput): this {
		this.#keys.delete(KeyIdSchema.parse(keyId));
		return this;
	}

	/**
	 * Returns random key from key ring
	 *
	 * Throws an error if key ring is empty
	 */
	getRandomKey(): KeyRing.Entry {
		if (this.#keys.size === 0) {
			throw ERRORS.NO_KEYS_IN_KEY_RING.create();
		}

		const entries = Array.from(this.#keys.entries());
		const entry = entries[Math.floor(Math.random() * entries.length)];
		return {id: entry[0], key: entry[1]};
	}

	getKeyById(keyIdInput: KeyIdInput): Key | undefined {
		return this.getKeyEntryById(keyIdInput)?.key;
	}

	getKeyEntryById(keyIdInput: KeyIdInput): KeyRing.Entry | undefined {
		const keyId = KeyIdSchema.parse(keyIdInput);
		const key = this.#keys.get(keyId);
		if (key) {
			return {id: keyId, key};
		}
	}
}

export namespace KeyRing {
	export interface Entry {
		id: KeyId;
		key: Key
	}
}
