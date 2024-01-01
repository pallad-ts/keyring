import {z} from "zod";
import {secret, Secret} from "@pallad/secret";

const HEX_REGEX = /^[a-f0-9]+$/i
export const KeySchema = z.union([
	z.custom(value => Secret.is(value)),
	z.instanceof(Buffer),
	z.string().min(1, "Key cannot be empty").transform(value => {
		return Buffer.from(value, isHexString(value) ? "hex" : "utf8");
	}),
], {
	errorMap(error, ctx) {
		if (error.code === z.ZodIssueCode.invalid_union) {
			return {message: 'Key must be a string, a buffer or a secret'};
		}
		return {message: ctx.defaultError};
	}
})
	.transform(value => Secret.is(value) ? value : secret(value))

function isHexString(value: string) {
	return HEX_REGEX.test(value) && value.length % 2 === 0;
}

export type KeyInput = z.input<typeof KeySchema>;

export type Key = z.infer<typeof KeySchema>
