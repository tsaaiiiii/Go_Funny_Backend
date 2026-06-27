import { eq } from "drizzle-orm";

import { contribution } from "@/db/schema";
import { newId, type AppDb } from "@/db/client";
import {
  ensureMembershipBelongsToTrip,
  ensureTripAccess,
} from "@/services/access";

export const createContribution = async (data: {
  db: AppDb;
  tripId: string;
  membershipId: string;
  amount: number;
  date: Date;
  userId: string;
}) => {
  const { db, userId, ...contributionData } = data;

  await ensureTripAccess(db, contributionData.tripId, userId);
  await ensureMembershipBelongsToTrip(
    db,
    contributionData.membershipId,
    contributionData.tripId,
  );

  const [createdContribution] = await db
    .insert(contribution)
    .values({ id: newId(), ...contributionData })
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
