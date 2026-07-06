import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  real,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const trip = sqliteTable("trip", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location"),
  currency: text("currency").notNull().default("TWD"),
  startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
  mode: text("mode", { enum: ["expense", "pool"] }).notNull(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id),
  createdAt: createdAt(),
});

export const tripMembership = sqliteTable(
  "trip_membership",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("trip_membership_trip_id_user_id_unique").on(
      table.tripId,
      table.userId,
    ),
    index("trip_membership_trip_id_idx").on(table.tripId),
  ],
);

export const expense = sqliteTable(
  "expense",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amount: integer("amount").notNull(),
    recordType: text("record_type", { enum: ["general", "pool"] })
      .notNull()
      .default("general"),
    currency: text("currency").notNull().default("TWD"),
    exchangeRateToBase: real("exchange_rate_to_base").notNull().default(1),
    settlementAmount: integer("settlement_amount").notNull().default(0),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    splitType: text("split_type", {
      enum: ["equal_all", "equal_selected", "custom"],
    }).notNull(),
    payerMembershipId: text("payer_membership_id").references(
      () => tripMembership.id,
    ),
    note: text("note"),
    createdAt: createdAt(),
  },
  (table) => [index("expense_trip_id_idx").on(table.tripId)],
);

export const expenseSplit = sqliteTable(
  "expense_split",
  {
    id: text("id").primaryKey(),
    expenseId: text("expense_id")
      .notNull()
      .references(() => expense.id, { onDelete: "cascade" }),
    membershipId: text("membership_id")
      .notNull()
      .references(() => tripMembership.id),
    amount: integer("amount").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("expense_split_expense_id_membership_id_unique").on(
      table.expenseId,
      table.membershipId,
    ),
    index("expense_split_expense_id_idx").on(table.expenseId),
  ],
);

export const contribution = sqliteTable(
  "contribution",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trip.id, { onDelete: "cascade" }),
    membershipId: text("membership_id")
      .notNull()
      .references(() => tripMembership.id),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("TWD"),
    exchangeRateToBase: real("exchange_rate_to_base").notNull().default(1),
    settlementAmount: integer("settlement_amount").notNull().default(0),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("contribution_trip_id_idx").on(table.tripId)],
);

export const invitation = sqliteTable("invitation", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trip.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  role: text("role", { enum: ["editor"] }).notNull().default("editor"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  createdByUserId: text("created_by_user_id").references(() => user.id),
  createdAt: createdAt(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  trip,
  tripMembership,
  expense,
  expenseSplit,
  contribution,
  invitation,
};
