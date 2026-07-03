import { eq } from "drizzle-orm";

import { contribution, trip } from "@/db/schema";
import { newId, type AppDb } from "@/db/client";
import { HttpError } from "@/lib/http-error";
import { normalizeCurrencyCode, resolveSettlementAmount } from "@/lib/currency";
import {
  ensureMembershipBelongsToTrip,
  ensureTripAccess,
} from "@/services/access";

export const createContribution = async (data: {
  db: AppDb;
  tripId: string;
  membershipId: string;
  amount: number;
  currency?: string;
  exchangeRateToBase?: number;
  date: Date;
  userId: string;
}) => {
  const { db, userId, currency, exchangeRateToBase, ...contributionData } = data;

  await ensureTripAccess(db, contributionData.tripId, userId);
  const currentTrip = await db.query.trip.findFirst({
    columns: { currency: true },
    where: eq(trip.id, contributionData.tripId),
  });

  if (!currentTrip) {
    throw new HttpError(404, "旅程不存在");
  }
  await ensureMembershipBelongsToTrip(
    db,
    contributionData.membershipId,
    contributionData.tripId,
  );

  const normalizedCurrency = normalizeCurrencyCode(currency ?? currentTrip.currency);
  const settlementRate = exchangeRateToBase ?? 1;

  if (
    normalizedCurrency !== currentTrip.currency &&
    exchangeRateToBase === undefined
  ) {
    throw new HttpError(400, "外幣記錄請提供匯率");
  }

  const [createdContribution] = await db
    .insert(contribution)
    .values({
      id: newId(),
      ...contributionData,
      currency: normalizedCurrency,
      exchangeRateToBase: settlementRate,
      settlementAmount: resolveSettlementAmount(
        contributionData.amount,
        settlementRate,
      ),
    })
    .returning();
  return createdContribution;
};

export const getContributions = async (
  db: AppDb,
  tripId: string,
  userId: string,
) => {
  await ensureTripAccess(db, tripId, userId);

  return await db
    .select()
    .from(contribution)
    .where(eq(contribution.tripId, tripId));
};
