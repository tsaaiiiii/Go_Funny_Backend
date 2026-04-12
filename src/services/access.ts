import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";

export const ensureTripAccess = async (tripId: string, userId: string) => {
  const membership = await prisma.tripMembership.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new HttpError(404, "旅程不存在");
  }

  return membership;
};

export const ensureTripOwner = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { createdByUserId: true },
  });

  if (!trip || trip.createdByUserId !== userId) {
    throw new HttpError(403, "只有旅程建立者可以執行此操作");
  }

  return trip;
};

export const ensureMembershipBelongsToTrip = async (
  membershipId: string,
  tripId: string,
) => {
  const membership = await prisma.tripMembership.findUnique({
    where: { id: membershipId },
  });

  if (!membership || membership.tripId !== tripId) {
    throw new HttpError(400, "成員不屬於此旅程");
  }

  return membership;
};
