import { and, eq, sql } from "drizzle-orm";

import { invitation, trip, tripMembership } from "@/db/schema";
import { newId, type AppDb } from "@/db/client";
import { ensureTripAccess } from "@/services/access";

const DEFAULT_INVITATION_EXPIRES_IN_MS = 24 * 60 * 60 * 1000;

const randomToken = () => {
  const values = new Uint8Array(16);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
};

export const createInvitation = async (
  db: AppDb,
  tripId: string,
  createdByUserId: string,
) => {
  await ensureTripAccess(db, tripId, createdByUserId);

  const token = randomToken();
  const expiresAt = new Date(Date.now() + DEFAULT_INVITATION_EXPIRES_IN_MS);

  const [createdInvitation] = await db
    .insert(invitation)
    .values({
      id: newId(),
      tripId,
      token,
      createdByUserId,
      expiresAt,
    })
    .returning();
  return createdInvitation;
};

export const getInvitationByToken = async (db: AppDb, token: string) => {
  const [row] = await db
    .select()
    .from(invitation)
    .innerJoin(trip, eq(invitation.tripId, trip.id))
    .where(eq(invitation.token, token));

  if (!row) return null;

  return { ...row.invitation, trip: row.trip };
};

export const acceptInvitation = async (
  db: AppDb,
  token: string,
  userId: string,
) => {
  const currentInvitation = await db.query.invitation.findFirst({
    where: eq(invitation.token, token),
  });

  if (!currentInvitation) {
    return null;
  }

  if (currentInvitation.revokedAt) {
    return { error: "邀請已被撤銷" };
  }

  if (currentInvitation.expiresAt && currentInvitation.expiresAt < new Date()) {
    return { error: "邀請已過期" };
  }

  if (
    currentInvitation.maxUses &&
    currentInvitation.usedCount >= currentInvitation.maxUses
  ) {
    return { error: "邀請已達使用上限" };
  }

  const existingMembership = await db.query.tripMembership.findFirst({
    where: and(
      eq(tripMembership.tripId, currentInvitation.tripId),
      eq(tripMembership.userId, userId),
    ),
  });

  if (existingMembership) {
    return { error: "你已加入此旅程" };
  }

  const [membership] = await db
    .insert(tripMembership)
    .values({
      id: newId(),
      tripId: currentInvitation.tripId,
      userId,
    })
    .returning();

  await db
    .update(invitation)
    .set({
      usedCount: sql`${invitation.usedCount} + 1`,
      acceptedAt: new Date(),
    })
    .where(eq(invitation.token, token));

  return membership;
};
