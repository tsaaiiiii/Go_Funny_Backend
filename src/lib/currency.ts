import { HttpError } from "@/lib/http-error";

export const DEFAULT_CURRENCY = "TWD";

export const normalizeCurrencyCode = (currency?: string | null) => {
  const normalized = currency?.trim().toUpperCase();

  return normalized || DEFAULT_CURRENCY;
};
