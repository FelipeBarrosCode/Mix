import { z } from "zod";

export const sendSchema = z.object({
  recipient: z.string().min(4),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  note: z.string().max(128).optional(),
});

export type SendSchema = z.infer<typeof sendSchema>;
