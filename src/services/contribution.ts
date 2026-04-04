import { prisma } from "@/lib/prisma";

export const createContribution = async (data: {
  tripId: string;
  membershipId: string;
  amount: number;
  date: Date;
}) => {
  return await prisma.contribution.create({ data });
};

export const getContributions = async (tripId: string) => {
  return await prisma.contribution.findMany({
    where: { tripId },
  });
};
