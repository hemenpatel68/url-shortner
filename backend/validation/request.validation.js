import * as z from "zod";

export const signupPostRequestBodySchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(3),
  })
  .strict();

export const loginPostRequestBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(3),
  })
  .strict();

export const shortenPostRequestBodySchema = z
  .object({
    url: z.string().url(),
    code: z.string().min(1).max(155).optional(),
  })
  .strict();

export const updateUrlRequestBodySchema = z
  .object({
    url: z.string().url().optional(),
    code: z.string().min(1).max(155).optional(),
  })
  .strict();

export const urlIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();
