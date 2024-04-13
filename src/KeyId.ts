import { z } from "zod";

export const KeyIdSchema = z
	.string()
	.trim()
	.min(1, "Key ID Cannot be empty")
	.regex(/^[a-z0-9_-]+$/i, "Key ID can contain only letters, numbers, underscores and dashes");
export type KeyId = z.infer<typeof KeyIdSchema>;
export type KeyIdInput = z.input<typeof KeyIdSchema>;
