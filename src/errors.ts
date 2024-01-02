import {ErrorDescriptor, formatCodeFactory, Domain} from "@pallad/errors";
import {KeyRingError} from "./KeyRingError";

const code = formatCodeFactory("E_PALLAD_KEYRING_%c");

export const ERRORS = new Domain().addErrorsDescriptorsMap({
	NO_SUCH_KEY: ErrorDescriptor.useMessageFormatter(
		code(1),
		(keyId: string) => `No such key: ${keyId}`,
		KeyRingError
	),
	KEY_ALREADY_EXISTS: ErrorDescriptor.useMessageFormatter(
		code(2),
		(keyId: string) => `Key already exists: ${keyId}`,
		KeyRingError
	),
	NO_KEYS_IN_KEY_RING: ErrorDescriptor.useDefaultMessage(
		code(3),
		"No keys in key ring",
		KeyRingError
	),
});
