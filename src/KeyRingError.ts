export class KeyRingError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'KeyRingError';
	}
}
