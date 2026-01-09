import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const circles = pgTable("circles", {
  id: serial("id").primaryKey(),
  pubkey: varchar("pubkey", { length: 64 }).notNull().unique(),
  creator: varchar("creator", { length: 64 }).notNull(),
  name: text("name"),
  contributionAmount: real("contribution_amount").notNull(),
  durationMonths: integer("duration_months").notNull(),
  maxMembers: integer("max_members").notNull(),
  currentMembers: integer("current_members").default(0),
  currentRound: integer("current_round").default(0),
  status: text("status").notNull().default("Forming"),
  payoutMethod: text("payout_method").notNull(),
  minTrustTier: integer("min_trust_tier").default(0),
  members: jsonb("members").$type<string[]>().default([]),
  payoutQueue: jsonb("payout_queue").$type<string[]>().default([]),
  insurancePool: varchar("insurance_pool", { length: 64 }),
  totalYieldEarned: real("total_yield_earned").default(0),
  isPublic: boolean("is_public").default(true),
  circleType: text("circle_type").notNull().default("Standard"),
  inviteCode: text("invite_code"),
  escrowAccount: varchar("escrow_account", { length: 64 }),
  penaltyRate: real("penalty_rate").default(0),
  totalPot: real("total_pot").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  pubkey: varchar("pubkey", { length: 64 }).notNull().unique(),
  trustScore: real("trust_score").default(0),
  trustTier: integer("trust_tier").default(0),
  paymentReliability: real("payment_reliability").default(0),
  circlesCompleted: integer("circles_completed").default(0),
  circlesDefaulted: integer("circles_defaulted").default(0),
  totalContributionsMade: integer("total_contributions_made").default(0),
  onTimePayments: integer("on_time_payments").default(0),
  latePayments: integer("late_payments").default(0),
  totalContributions: real("total_contributions").default(0),
  totalPayouts: real("total_payouts").default(0),
  totalYieldEarned: real("total_yield_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  signature: varchar("signature", { length: 128 }).notNull().unique(),
  type: text("type").notNull(),
  circleId: integer("circle_id"),
  userPubkey: varchar("user_pubkey", { length: 64 }),
  amount: real("amount"),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").default("confirmed"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull(),
  userPubkey: varchar("user_pubkey", { length: 64 }).notNull(),
  stakeAmount: real("stake_amount").default(0),
  contributionHistory: jsonb("contribution_history").$type<number[]>().default([]),
  payoutClaimed: boolean("payout_claimed").default(false),
  payoutPosition: integer("payout_position").default(0),
  insuranceStaked: real("insurance_staked").default(0),
  status: text("status").default("Active"),
  hasReceivedPot: boolean("has_received_pot").default(false),
  penalties: real("penalties").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  contributionsMissed: integer("contributions_missed").default(0),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalCircles: integer("total_circles").default(0),
  activeCircles: integer("active_circles").default(0),
  totalVolume: real("total_volume").default(0),
  totalTransactions: integer("total_transactions").default(0),
  avgTrustScore: real("avg_trust_score").default(0),
  newUsers: integer("new_users").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circlesRelations = relations(circles, ({ many }) => ({
  transactions: many(transactions),
  members: many(members),
}));

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  members: many(members),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  circle: one(circles, {
    fields: [transactions.circleId],
    references: [circles.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  circle: one(circles, {
    fields: [members.circleId],
    references: [circles.id],
  }),
}));

export const insertCircleSchema = createInsertSchema(circles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  joinedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export type Circle = typeof circles.$inferSelect;
export type InsertCircle = z.infer<typeof insertCircleSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
