import { prisma } from "@/lib/prisma";

export const createMember = async (tripId: string, userId: string) => {
  return await prisma.tripMembership.create({
    data: { tripId, userId },
  });
};

export const deleteMember = async (memberId: string) => {
  return await prisma.tripMembership.delete({
    where: { id: memberId },
  });
};

export const getMembers = async (tripId: string) => {
  return await prisma.tripMembership.findMany({
    where: { tripId },
  });
};
