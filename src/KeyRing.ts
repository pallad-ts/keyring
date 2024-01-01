import {Key, KeyInput, KeySchema} from "./Key";
import {KeyId, KeyIdInput, KeyIdSchema} from "./KeyId";
import {createAssertion} from "@pallad/assert-helper";

export class KeyRing {
	#keys = new Map<KeyId, Key>();

	assertKeyById = createAssertion((id: KeyIdInput) => {
		return this.getKeyById(id);
	}, id => {
		return new Error(`No such key: ${id}`);
	})

	addKey(key: KeyInput, keyId: KeyIdInput) {
		this.#keys.set(KeyIdSchema.parse(keyId), KeySchema.parse(key));
	}

	getRandomKey() {
		const entries = Array.from(this.#keys.entries());
		const entry = entries[Math.floor(Math.random() * entries.length)];
		return {id: entry[0], key: entry[1]};
	}

	getKeyById(keyIdInput: KeyIdInput): Key | undefined {
		const keyId = KeyIdSchema.parse(keyIdInput);
		return this.#keys.get(keyId);
	}

}

export namespace KeyRing {
	export interface KeyEntry {
		id: KeyId;
		key: Key
	}
}
