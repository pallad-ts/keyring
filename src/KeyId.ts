import { z } from "zod";

export const KeyIdSchema = z.string().min(1, "Key ID Cannot be empty");
export type KeyId = z.infer<typeof KeyIdSchema>;
export type KeyIdInput = z.input<typeof KeyIdSchema>;
