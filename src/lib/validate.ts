import type { ZodType } from "zod";
import { ZodError } from "zod";

import { HttpError } from "@/lib/http-error";

export const parseWithSchema = <T extends ZodType>(
  schema: T,
  input: unknown,
) => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(400, error.issues[0]?.message ?? "請求格式錯誤");
    }

    throw error;
  }
};
