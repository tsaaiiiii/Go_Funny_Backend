import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";
import { ensureTripAccess } from "@/services/access";

export const getMembers = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  return await prisma.tripMembership.findMany({
    where: { tripId },
    include: { user: true },
  });
};

export const deleteMember = async (
  memberId: string,
  tripId: string,
  userId: string,
) => {
  await ensureTripAccess(tripId, userId);

  const membership = await prisma.tripMembership.findFirst({
    where: {
      id: memberId,
      tripId,
    },
  });

  if (!membership) {
    throw new HttpError(404, "成員不存在");
  }

  return await prisma.tripMembership.delete({
    where: { id: memberId },
  });
};
