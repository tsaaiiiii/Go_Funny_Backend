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
