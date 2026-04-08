import { prisma } from "@/lib/prisma";
import {
  ensureMembershipBelongsToTrip,
  ensureTripAccess,
} from "@/services/access";

export const createContribution = async (data: {
  tripId: string;
  membershipId: string;
  amount: number;
  date: Date;
  userId: string;
}) => {
  const { userId, ...contributionData } = data;

  await ensureTripAccess(contributionData.tripId, userId);
  await ensureMembershipBelongsToTrip(
    contributionData.membershipId,
    contributionData.tripId,
  );

  return await prisma.contribution.create({ data: contributionData });
};

export const getContributions = async (tripId: string, userId: string) => {
  await ensureTripAccess(tripId, userId);

  return await prisma.contribution.findMany({
    where: { tripId },
  });
};
