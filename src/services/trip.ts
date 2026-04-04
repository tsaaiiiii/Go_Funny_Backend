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
  return prisma.trip.findMany();
};
