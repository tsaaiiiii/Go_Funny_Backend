import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { ensureTripAccess } from "@/services/access";

export const createInvitation = async (
  tripId: string,
  createdByUserId: string,
) => {
  await ensureTripAccess(tripId, createdByUserId);

  const token = randomBytes(16).toString("hex");

  return await prisma.invitation.create({
    data: {
      tripId,
      token,
      createdByUserId,
    },
  });
};

export const getInvitationByToken = async (token: string) => {
  return await prisma.invitation.findUnique({
    where: { token },
    include: { trip: true },
  });
};

export const acceptInvitation = async (token: string, userId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return null;
  }

  if (invitation.revokedAt) {
    return { error: "邀請已被撤銷" };
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    return { error: "邀請已過期" };
  }

  if (invitation.maxUses && invitation.usedCount >= invitation.maxUses) {
    return { error: "邀請已達使用上限" };
  }

  const existingMembership = await prisma.tripMembership.findUnique({
    where: {
      tripId_userId: {
        tripId: invitation.tripId,
        userId,
      },
    },
  });

  if (existingMembership) {
    return { error: "你已加入此旅程" };
  }

  const [membership] = await prisma.$transaction([
    prisma.tripMembership.create({
      data: {
        tripId: invitation.tripId,
        userId,
      },
    }),
    prisma.invitation.update({
      where: { token },
      data: {
        usedCount: { increment: 1 },
        acceptedAt: new Date(),
      },
    }),
  ]);

  return membership;
};
