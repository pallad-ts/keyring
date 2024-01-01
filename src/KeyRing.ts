import {Key, KeyInput, KeySchema} from "./Key";
import {KeyId, KeyIdInput, KeyIdSchema} from "./KeyId";
import {createAssertion} from "@pallad/assert-helper";
import {KeyRingError} from "./KeyRingError";

export class KeyRing {
	#keys = new Map<KeyId, Key>();

	assertKeyById = createAssertion((id: KeyIdInput) => {
		return this.getKeyById(id);
	}, id => {
		return new KeyRingError(`No such key: ${id}`);
	})

	addKey(keyId: KeyIdInput, key: KeyInput,) {
		this.#keys.set(KeyIdSchema.parse(keyId), KeySchema.parse(key));
	}

	getRandomKey(): KeyRing.Entry {
		if (this.#keys.size === 0) {
			throw new KeyRingError('No keys in key ring');
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
