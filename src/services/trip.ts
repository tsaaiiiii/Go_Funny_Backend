import { and, eq, inArray } from "drizzle-orm";

import { contribution, expense, expenseSplit, trip, tripMembership, user } from "@/db/schema";
import { newId, type AppDb } from "@/db/client";
import { HttpError } from "@/lib/http-error";
import { normalizeCurrencyCode } from "@/lib/currency";
import { ensureTripAccess } from "@/services/access";

export const createTrip = async (data: {
  db: AppDb;
  title: string;
  mode: "expense" | "pool";
  startDate: Date;
  endDate: Date;
  location?: string;
  currency?: string;
  userId: string;
}) => {
  const { db, userId, ...tripData } = data;
  const nowTrip = {
    id: newId(),
    ...tripData,
    currency: normalizeCurrencyCode(tripData.currency),
    createdByUserId: userId,
  };

  await db.insert(trip).values(nowTrip);
  await db.insert(tripMembership).values({
    id: newId(),
    tripId: nowTrip.id,
    userId,
  });

  return nowTrip;
};

const attachTripDetails = async (db: AppDb, rows: (typeof trip.$inferSelect)[]) => {
  if (rows.length === 0) return [];

  const tripIds = rows.map((row) => row.id);
  const memberships = await db
    .select()
    .from(tripMembership)
    .innerJoin(user, eq(tripMembership.userId, user.id))
    .where(inArray(tripMembership.tripId, tripIds));
  const expenses = await db
    .select()
    .from(expense)
    .where(inArray(expense.tripId, tripIds));
  const expenseIds = expenses.map((row) => row.id);
  const splits =
    expenseIds.length > 0
      ? await db
          .select()
          .from(expenseSplit)
          .where(inArray(expenseSplit.expenseId, expenseIds))
      : [];
  const contributions = await db
    .select()
    .from(contribution)
    .where(inArray(contribution.tripId, tripIds));

  return rows.map((row) => ({
    ...row,
    memberships: memberships
      .filter((membership) => membership.trip_membership.tripId === row.id)
      .map((membership) => ({
        ...membership.trip_membership,
        user: membership.user,
      })),
    expenses: expenses
      .filter((item) => item.tripId === row.id)
      .map((item) => ({
        ...item,
        splits: splits.filter((split) => split.expenseId === item.id),
      })),
    contributions: contributions.filter((item) => item.tripId === row.id),
  }));
};

export const getTrips = async (db: AppDb, userId: string) => {
  const memberships = await db
    .select({ tripId: tripMembership.tripId })
    .from(tripMembership)
    .where(eq(tripMembership.userId, userId));

  if (memberships.length === 0) return [];

  const rows = await db
    .select()
    .from(trip)
    .where(inArray(trip.id, memberships.map((membership) => membership.tripId)));

  return attachTripDetails(db, rows);
};

export const getTripById = async (db: AppDb, id: string, userId: string) => {
  await ensureTripAccess(db, id, userId);

  const row = await db.query.trip.findFirst({
    where: eq(trip.id, id),
  });

  if (!row) return null;

  const [detail] = await attachTripDetails(db, [row]);
  return detail;
};

export const editTrip = async (
  db: AppDb,
  id: string,
  userId: string,
  data: {
    title?: string;
    mode?: "expense" | "pool";
    startDate?: Date;
    endDate?: Date;
    location?: string;
    currency?: string;
  },
) => {
  await ensureTripAccess(db, id, userId);
  const updateData = {
    ...data,
    ...(data.currency ? { currency: normalizeCurrencyCode(data.currency) } : {}),
  };
  const [updatedTrip] = await db
    .update(trip)
    .set(updateData)
    .where(eq(trip.id, id))
    .returning();
  return updatedTrip;
};

export const deleteTrip = async (db: AppDb, id: string, userId: string) => {
  const currentTrip = await db.query.trip.findFirst({
    columns: { createdByUserId: true },
    where: eq(trip.id, id),
  });

  if (!currentTrip) {
    throw new HttpError(404, "旅程不存在");
  }

  if (currentTrip.createdByUserId !== userId) {
    throw new HttpError(403, "只有旅程建立者可以執行此操作");
  }

  const [deletedTrip] = await db.delete(trip).where(eq(trip.id, id)).returning();
  return deletedTrip;
};
