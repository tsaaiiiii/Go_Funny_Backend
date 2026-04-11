import { z } from "@/openapi/zod";

const dateSchema = z.string().openapi({
  format: "date",
  example: "2026-05-01",
});

const dateTimeSchema = z.string().openapi({
  format: "date-time",
  example: "2026-05-01T00:00:00.000Z",
});

const idSchema = (example: string) =>
  z.string().min(1).openapi({ example });

export const tripModeSchema = z
  .enum(["expense", "pool"])
  .openapi("TripMode");

export const splitTypeSchema = z
  .enum(["equal_all", "equal_selected", "custom"])
  .openapi("SplitType");

export const invitationRoleSchema = z.enum(["editor"]).openapi("InvitationRole");

export const errorResponseSchema = z
  .object({
    code: z.string().openapi({ example: "not_found" }),
    message: z.string().openapi({ example: "旅程不存在" }),
  })
  .openapi("ErrorResponse");

export const validationIssueSchema = z
  .object({
    path: z.string().openapi({ example: "title" }),
    message: z.string().openapi({ example: "Invalid input: expected string, received undefined" }),
    code: z.string().openapi({ example: "invalid_type" }),
  })
  .openapi("ValidationIssue");

export const badRequestErrorResponseSchema = z
  .object({
    code: z.enum(["validation_error", "business_error"]).openapi({
      example: "validation_error",
    }),
    message: z.string().openapi({ example: "請求格式錯誤" }),
    issues: z.array(validationIssueSchema).optional(),
  })
  .openapi("BadRequestErrorResponse");

export const unauthorizedErrorResponseSchema = z
  .object({
    code: z.literal("unauthorized").openapi({ example: "unauthorized" }),
    message: z.string().openapi({ example: "請先登入" }),
  })
  .openapi("UnauthorizedErrorResponse");

export const userSchema = z
  .object({
    id: idSchema("cm123user"),
    email: z.string().email().openapi({ example: "user@example.com" }),
    name: z.string().openapi({ example: "Alex" }),
    emailVerified: z.boolean().openapi({ example: true }),
    image: z.string().nullable().openapi({ example: "https://example.com/avatar.png" }),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .openapi("User");

export const tripSchema = z
  .object({
    id: idSchema("cm123trip"),
    title: z.string().openapi({ example: "東京五日遊" }),
    location: z.string().nullable().openapi({ example: "東京" }),
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
    mode: tripModeSchema,
    createdAt: dateTimeSchema,
  })
  .openapi("Trip");

export const tripMembershipSchema = z
  .object({
    id: idSchema("cm123membership"),
    tripId: idSchema("cm123trip"),
    userId: idSchema("cm123user"),
    createdAt: dateTimeSchema,
  })
  .openapi("TripMembership");

export const tripMembershipWithUserSchema = tripMembershipSchema
  .extend({
    user: userSchema,
  })
  .openapi("TripMembershipWithUser");

export const expenseSplitSchema = z
  .object({
    id: idSchema("cm123split"),
    expenseId: idSchema("cm123expense"),
    membershipId: idSchema("cm123membership"),
    amount: z.number().int().openapi({ example: 600 }),
    createdAt: dateTimeSchema,
  })
  .openapi("ExpenseSplit");

export const expenseSchema = z
  .object({
    id: idSchema("cm123expense"),
    tripId: idSchema("cm123trip"),
    title: z.string().openapi({ example: "午餐" }),
    amount: z.number().int().openapi({ example: 1200 }),
    date: dateTimeSchema,
    splitType: splitTypeSchema,
    payerMembershipId: idSchema("cm123membership").nullable(),
    note: z.string().nullable().openapi({ example: "晴空塔附近" }),
    createdAt: dateTimeSchema,
  })
  .openapi("Expense");

export const expenseWithSplitsSchema = expenseSchema
  .extend({
    splits: z.array(expenseSplitSchema),
  })
  .openapi("ExpenseWithSplits");

export const contributionSchema = z
  .object({
    id: idSchema("cm123contribution"),
    tripId: idSchema("cm123trip"),
    membershipId: idSchema("cm123membership"),
    amount: z.number().int().openapi({ example: 500 }),
    date: dateTimeSchema,
    createdAt: dateTimeSchema,
  })
  .openapi("Contribution");

export const invitationSchema = z
  .object({
    id: idSchema("cm123invitation"),
    tripId: idSchema("cm123trip"),
    token: z.string().openapi({ example: "4bb2a2e38a77a1ef0123456789abcdef" }),
    role: invitationRoleSchema,
    maxUses: z.number().int().nullable().openapi({ example: 10 }),
    usedCount: z.number().int().openapi({ example: 1 }),
    expiresAt: dateTimeSchema.nullable(),
    acceptedAt: dateTimeSchema.nullable(),
    revokedAt: dateTimeSchema.nullable(),
    createdByUserId: idSchema("cm123user").nullable(),
    createdAt: dateTimeSchema,
  })
  .openapi("Invitation");

export const invitationWithTripSchema = invitationSchema
  .extend({
    trip: tripSchema,
  })
  .openapi("InvitationWithTrip");

export const tripDetailSchema = tripSchema
  .extend({
    memberships: z.array(tripMembershipWithUserSchema),
    expenses: z.array(expenseWithSplitsSchema),
    contributions: z.array(contributionSchema),
  })
  .openapi("TripDetail");

export const settlementTransferSchema = z
  .object({
    from: idSchema("cm123membershipA"),
    to: idSchema("cm123membershipB"),
    amount: z.number().openapi({ example: 300 }),
  })
  .openapi("SettlementTransfer");

export const settlementSchema = z
  .object({
    tripId: idSchema("cm123trip"),
    mode: tripModeSchema,
    transfers: z.array(settlementTransferSchema),
  })
  .openapi("Settlement");

export const createTripBodySchema = z
  .strictObject({
    title: z.string().min(1).openapi({ example: "東京五日遊" }),
    mode: tripModeSchema,
    location: z.string().min(1).optional().openapi({ example: "東京" }),
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .openapi("CreateTripRequest");

export const updateTripBodySchema = z
  .strictObject({
    title: z.string().min(1).optional().openapi({ example: "東京五日遊" }),
    mode: tripModeSchema.optional(),
    location: z.string().min(1).optional().openapi({ example: "東京" }),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .openapi("UpdateTripRequest");

export const createExpenseBodySchema = z
  .strictObject({
    title: z.string().min(1).openapi({ example: "午餐" }),
    amount: z.number().int().openapi({ example: 1200 }),
    date: dateSchema,
    splitType: splitTypeSchema,
    payerMembershipId: idSchema("cm123membership").optional(),
    note: z.string().min(1).optional().openapi({ example: "晴空塔附近" }),
  })
  .openapi("CreateExpenseRequest");

export const createContributionBodySchema = z
  .strictObject({
    membershipId: idSchema("cm123membership"),
    amount: z.number().int().openapi({ example: 500 }),
    date: dateSchema,
  })
  .openapi("CreateContributionRequest");

export const tripIdParamsSchema = z.object({
  tripId: idSchema("cm123trip"),
});

export const tripIdExpenseIdParamsSchema = z.object({
  tripId: idSchema("cm123trip"),
  expenseId: idSchema("cm123expense"),
});

export const tripIdMemberIdParamsSchema = z.object({
  tripId: idSchema("cm123trip"),
  memberId: idSchema("cm123membership"),
});

export const tokenParamsSchema = z.object({
  token: z.string().min(1).openapi({ example: "4bb2a2e38a77a1ef0123456789abcdef" }),
});

export type CreateTripBody = z.infer<typeof createTripBodySchema>;
export type UpdateTripBody = z.infer<typeof updateTripBodySchema>;
export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;
export type CreateContributionBody = z.infer<typeof createContributionBodySchema>;
