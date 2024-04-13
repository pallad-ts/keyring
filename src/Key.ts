import { z } from "zod";
import { secret, Secret } from "@pallad/secret";

const HEX_REGEX = /^[a-f0-9]+$/i;

// eslint-disable-next-line @typescript-eslint/naming-convention
const BufferableKeyDataSchema = z.union([
	z.instanceof(Buffer),
	z
		.string()
		.min(1, "Key cannot be empty")
		.refine(isHexString, "Invalid hex string")
		.transform(value => {
			return Buffer.from(value, "hex");
		}),
]);
export const KeySchema = z
	.union(
		[
			z
				.custom<Secret<any>>(value => Secret.is(value))
				.transform(value => value.getValue())
				.pipe(BufferableKeyDataSchema),
			BufferableKeyDataSchema,
		],
		{
			errorMap(error, ctx) {
				if (error.code === z.ZodIssueCode.invalid_union) {
					return {
						message: "Key must be a hex string, a buffer or a secret",
					};
				}
				return { message: ctx.defaultError };
			},
		}
	)
	.transform(value => secret(value));

function isHexString(value: string) {
	return HEX_REGEX.test(value) && value.length % 2 === 0;
}

export type KeyInput = z.input<typeof KeySchema>;

export type Key = z.infer<typeof KeySchema>;
