import { ErrorDescriptor, formatCodeFactory, Domain } from "@pallad/errors";
import { KeyRingError } from "./KeyRingError";
import { Range } from "@pallad/range";

const code = formatCodeFactory("E_PALLAD_KEYRING_%c");

export const ERRORS = new Domain().addErrorsDescriptorsMap({
	NO_SUCH_KEY: ErrorDescriptor.useMessageFormatter(code(1), (keyId: string) => `No such key: ${keyId}`, KeyRingError),
	KEY_ALREADY_EXISTS: ErrorDescriptor.useMessageFormatter(
		code(2),
		(keyId: string) => `Key already exists: ${keyId}`,
		KeyRingError
	),
	NO_AVAILABLE_KEYS_IN_KEY_RING: ErrorDescriptor.useDefaultMessage(
		code(3),
		"No available keys in key ring",
		KeyRingError
	),
	INVALID_KEY_SIZE: ErrorDescriptor.useMessageFormatter(
		code(4),
		(range: Range<number>, keySize: number) => {
			const rangeDescription = Range.map(range, {
				start: ({ start }) => "at least " + start,
				end: ({ end }) => "at most " + end,
				full: ({ start, end }) => "between " + start + " and " + end,
			});

			return `Key size must be ${rangeDescription}, got ${keySize}`;
		},
		KeyRingError
	),
	CUSTOM_VALIDATION_VIOLATED: ErrorDescriptor.useMessageFormatter(
		code(5),
		(message: string) => `Key custom validation violated: ${message}`,
		KeyRingError
	),
});
