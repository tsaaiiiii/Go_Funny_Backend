import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";
import { ensureTripAccess } from "@/services/access";

export const createTrip = async (data: {
  title: string;
  mode: "expense" | "pool";
  startDate: Date;
  endDate: Date;
  location?: string;
  userId: string;
}) => {
  const { userId, ...tripData } = data;

  return prisma.trip.create({
    data: {
      ...tripData,
      createdByUserId: userId,
      memberships: {
        create: {
          userId,
        },
      },
    },
  });
};

export const getTrips = async (userId: string) => {
  return prisma.trip.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: { include: { user: true } },
      expenses: { include: { splits: true } },
      contributions: true,
    },
  });
};

export const getTripById = async (id: string, userId: string) => {
  return prisma.trip.findFirst({
    where: {
      id,
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: { include: { user: true } },
      expenses: { include: { splits: true } },
      contributions: true,
    },
  });
};

export const editTrip = async (
  id: string,
  userId: string,
  data: {
    title?: string;
    mode?: "expense" | "pool";
    startDate?: Date;
    endDate?: Date;
    location?: string;
  },
) => {
  await ensureTripAccess(id, userId);
  return prisma.trip.update({ where: { id }, data });
};

export const deleteTrip = async (id: string, userId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { createdByUserId: true },
  });

  if (!trip) {
    throw new HttpError(404, "旅程不存在");
  }

  if (trip.createdByUserId !== userId) {
    throw new HttpError(403, "只有旅程建立者可以執行此操作");
  }

  return prisma.trip.delete({ where: { id } });
};
