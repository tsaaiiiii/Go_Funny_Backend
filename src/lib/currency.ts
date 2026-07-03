import { HttpError } from "@/lib/http-error";

export const DEFAULT_CURRENCY = "TWD";

export const normalizeCurrencyCode = (currency?: string | null) => {
  const normalized = currency?.trim().toUpperCase();

  return normalized || DEFAULT_CURRENCY;
};

export const resolveSettlementAmount = (
  amount: number,
  exchangeRateToBase?: number,
) => {
  const rate = exchangeRateToBase ?? 1;

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new HttpError(400, "匯率必須大於 0");
  }

  return Math.round(amount * rate);
};
