import { prisma } from "@/lib/prisma";

export const createTrip = async (data: {
  title: string;
  mode: "expense" | "pool";
  startDate: Date;
  endDate: Date;
  location?: string;
}) => {
  return prisma.trip.create({ data });
};

export const getTrips = async () => {
  return prisma.trip.findMany({
    include: {
      memberships: { include: { user: true } },
      expenses: { include: { splits: true } },
      contributions: true,
    },
  });
};

export const deleteTrip = async (id: string) => {
  return prisma.trip.delete({ where: { id } });
};

export const getTripById = async (id: string) => {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: true } },
      expenses: { include: { splits: true } },
      contributions: true,
    },
  });
};

export const editTrip = async (
  id: string,
  data: {
    title?: string;
    mode?: "expense" | "pool";
    startDate?: Date;
    endDate?: Date;
    location?: string;
  },
) => {
  return prisma.trip.update({ where: { id }, data });
};
