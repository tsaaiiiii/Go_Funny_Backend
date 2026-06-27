import { and, eq } from "drizzle-orm";

import { trip, tripMembership } from "@/db/schema";
import { HttpError } from "@/lib/http-error";
import type { AppDb } from "@/db/client";

export const ensureTripAccess = async (
  db: AppDb,
  tripId: string,
  userId: string,
) => {
  const membership = await db.query.tripMembership.findFirst({
    where: and(
      eq(tripMembership.tripId, tripId),
      eq(tripMembership.userId, userId),
    ),
  });

  if (!membership) {
    throw new HttpError(404, "旅程不存在");
  }

  return membership;
};

export const ensureTripOwner = async (
  db: AppDb,
  tripId: string,
  userId: string,
) => {
  await ensureTripAccess(db, tripId, userId);

  const currentTrip = await db.query.trip.findFirst({
    columns: { createdByUserId: true },
    where: eq(trip.id, tripId),
  });

  if (!currentTrip || currentTrip.createdByUserId !== userId) {
    throw new HttpError(403, "只有旅程建立者可以執行此操作");
  }

  return currentTrip;
};

export const ensureMembershipBelongsToTrip = async (
  db: AppDb,
  membershipId: string,
  tripId: string,
) => {
  const membership = await db.query.tripMembership.findFirst({
    where: eq(tripMembership.id, membershipId),
  });

  if (!membership || membership.tripId !== tripId) {
    throw new HttpError(400, "成員不屬於此旅程");
  }

  return membership;
};
