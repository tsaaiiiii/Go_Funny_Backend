import { prisma } from "@/lib/prisma";

export const getMembers = async (tripId: string) => {
  return await prisma.tripMembership.findMany({
    where: { tripId },
    include: { user: true },
  });
};

export const deleteMember = async (memberId: string) => {
  return await prisma.tripMembership.delete({
    where: { id: memberId },
  });
};
