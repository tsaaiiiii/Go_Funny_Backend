import { and, eq } from "drizzle-orm";

import { tripMembership, user } from "@/db/schema";
import type { AppDb } from "@/db/client";
import { HttpError } from "@/lib/http-error";
import { ensureTripAccess, ensureTripOwner } from "@/services/access";

export const getMembers = async (db: AppDb, tripId: string, userId: string) => {
  await ensureTripAccess(db, tripId, userId);

  const memberships = await db
    .select()
    .from(tripMembership)
    .innerJoin(user, eq(tripMembership.userId, user.id))
    .where(eq(tripMembership.tripId, tripId));

  return memberships.map((membership) => ({
    ...membership.trip_membership,
    user: membership.user,
  }));
};

export const deleteMember = async (
  db: AppDb,
  memberId: string,
  tripId: string,
  userId: string,
) => {
  const currentTrip = await ensureTripOwner(db, tripId, userId);

  const membership = await db.query.tripMembership.findFirst({
    where: and(eq(tripMembership.id, memberId), eq(tripMembership.tripId, tripId)),
  });

  if (!membership) {
    throw new HttpError(404, "成員不存在");
  }

  if (membership.userId === currentTrip.createdByUserId) {
    throw new HttpError(400, "不可刪除旅程建立者");
  }

  const [deletedMembership] = await db
    .delete(tripMembership)
    .where(eq(tripMembership.id, memberId))
    .returning();
  return deletedMembership;
};
