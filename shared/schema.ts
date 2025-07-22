import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  codeName: varchar("code_name").unique().notNull(), // Required for confidentiality
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"),
  role: varchar("role").default("user"), // user, admin, super_admin
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journey progress tracking
export const journeyProgress = pgTable("journey_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStep: integer("current_step").default(1),
  completedSteps: jsonb("completed_steps").default("[]"),
  overallProgress: real("overall_progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stepNumber: integer("step_number").notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User ratings and feedback
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  stepNumber: integer("step_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audio session tracking
export const audioSessions = pgTable("audio_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  audioId: varchar("audio_id").notNull(),
  title: varchar("title").notNull(),
  duration: integer("duration").notNull(),
  progress: real("progress").default(0),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Release exercises
export const releaseExercises = pgTable("release_exercises", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Movement exercises tracking
export const movementExercises = pgTable("movement_exercises", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseType: varchar("exercise_type").notNull(),
  duration: integer("duration").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin logs for tracking admin actions
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  targetType: varchar("target_type"), // user, report, etc.
  targetId: varchar("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});



// System metrics for real-time monitoring
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(), // user_signups, active_users, etc.
  value: real("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Admin reports
export const adminReports = pgTable("admin_reports", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  reportType: varchar("report_type").notNull(), // user_activity, revenue, etc.
  config: jsonb("config").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Free resource access tracking
export const freeResourceAccess = pgTable("free_resource_access", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  resourceName: varchar("resource_name").notNull(),
  resourceUrl: text("resource_url").notNull(),
  accessCount: integer("access_count").default(1),
  firstAccessedAt: timestamp("first_accessed_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// Step content blocks for before/after text
export const stepContentBlocks = pgTable("step_content_blocks", {
  id: serial("id").primaryKey(),
  stepNumber: integer("step_number").notNull(),
  position: varchar("position").notNull(), // 'before' or 'after'
  title: varchar("title"),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Chatbot conversations for Guided Journey
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull(), // For grouping related messages
  stepNumber: integer("step_number"), // Optional: link to specific RELEASE step
  title: varchar("title").default("Forgiveness Chat"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual AI chat messages
export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aiConversations.id),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional AI context
  createdAt: timestamp("created_at").defaultNow(),
});

// Group therapy sessions for premium users
export const groupSessions = pgTable("group_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  facilitatorId: varchar("facilitator_id").references(() => users.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  maxParticipants: integer("max_participants").default(8),
  currentParticipants: integer("current_participants").default(0),
  sessionType: varchar("session_type").default("forgiveness_group"), // forgiveness_group, meditation, etc.
  status: varchar("status").default("scheduled"), // scheduled, active, completed, cancelled
  meetingLink: text("meeting_link"),
  sessionNotes: text("session_notes"),
  sessionFee: decimal("session_fee", { precision: 10, scale: 2 }).default("0.00"), // 0.00 for free sessions
  isRecurring: boolean("is_recurring").default(false),
  recurringDayOfWeek: integer("recurring_day_of_week"), // 0=Sunday, 1=Monday, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group session participants
export const groupSessionParticipants = pgTable("group_session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => groupSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  codeName: varchar("code_name"), // User's chosen code name for privacy
  registeredAt: timestamp("registered_at").defaultNow(),
  attended: boolean("attended").default(false),
  feedbackRating: integer("feedback_rating"), // 1-5 stars
  feedbackComment: text("feedback_comment"),
});

// Payment tracking for paid group sessions
export const groupSessionPayments = pgTable("group_session_payments", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => groupSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentIntentId: varchar("payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, paid, failed, refunded
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Facilitators for group sessions
export const facilitators = pgTable("facilitators", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").unique(),
  bio: text("bio"),
  specialties: text("specialties").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premium feature access tracking
export const premiumFeatureAccess = pgTable("premium_feature_access", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  featureName: varchar("feature_name").notNull(), // 'ai_chatbot', 'group_sessions', 'priority_support'
  accessCount: integer("access_count").default(1),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  journeyProgress: many(journeyProgress),
  journalEntries: many(journalEntries),
  userRatings: many(userRatings),
  audioSessions: many(audioSessions),
  releaseExercises: many(releaseExercises),
  movementExercises: many(movementExercises),
  freeResourceAccess: many(freeResourceAccess),
}));

export const journeyProgressRelations = relations(journeyProgress, ({ one }) => ({
  user: one(users, {
    fields: [journeyProgress.userId],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
}));

export const audioSessionsRelations = relations(audioSessions, ({ one }) => ({
  user: one(users, {
    fields: [audioSessions.userId],
    references: [users.id],
  }),
}));

export const releaseExercisesRelations = relations(releaseExercises, ({ one }) => ({
  user: one(users, {
    fields: [releaseExercises.userId],
    references: [users.id],
  }),
}));

export const movementExercisesRelations = relations(movementExercises, ({ one }) => ({
  user: one(users, {
    fields: [movementExercises.userId],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export const adminReportsRelations = relations(adminReports, ({ one }) => ({
  creator: one(users, {
    fields: [adminReports.createdBy],
    references: [users.id],
  }),
}));

export const freeResourceAccessRelations = relations(freeResourceAccess, ({ one }) => ({
  user: one(users, {
    fields: [freeResourceAccess.userId],
    references: [users.id],
  }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  messages: many(aiChatMessages),
}));

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiChatMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

export const groupSessionsRelations = relations(groupSessions, ({ one, many }) => ({
  facilitator: one(users, {
    fields: [groupSessions.facilitatorId],
    references: [users.id],
  }),
  participants: many(groupSessionParticipants),
}));

export const groupSessionParticipantsRelations = relations(groupSessionParticipants, ({ one }) => ({
  session: one(groupSessions, {
    fields: [groupSessionParticipants.sessionId],
    references: [groupSessions.id],
  }),
  user: one(users, {
    fields: [groupSessionParticipants.userId],
    references: [users.id],
  }),
}));

export const premiumFeatureAccessRelations = relations(premiumFeatureAccess, ({ one }) => ({
  user: one(users, {
    fields: [premiumFeatureAccess.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertJourneyProgressSchema = createInsertSchema(journeyProgress);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertUserRatingSchema = createInsertSchema(userRatings);
export const insertAudioSessionSchema = createInsertSchema(audioSessions);
export const insertReleaseExerciseSchema = createInsertSchema(releaseExercises);
export const insertMovementExerciseSchema = createInsertSchema(movementExercises);
export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const insertSystemMetricSchema = createInsertSchema(systemMetrics);
export const insertAdminReportSchema = createInsertSchema(adminReports);
export const insertFreeResourceAccessSchema = createInsertSchema(freeResourceAccess);
export const insertStepContentBlockSchema = createInsertSchema(stepContentBlocks);
export const insertAiConversationSchema = createInsertSchema(aiConversations);
export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages);
export const insertGroupSessionSchema = createInsertSchema(groupSessions);
export const insertGroupSessionParticipantSchema = createInsertSchema(groupSessionParticipants);
export const insertGroupSessionPaymentSchema = createInsertSchema(groupSessionPayments);
export const insertFacilitatorSchema = createInsertSchema(facilitators);
export const insertPremiumFeatureAccessSchema = createInsertSchema(premiumFeatureAccess);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type JourneyProgress = typeof journeyProgress.$inferSelect;
export type InsertJourneyProgress = typeof journeyProgress.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = typeof userRatings.$inferInsert;
export type AudioSession = typeof audioSessions.$inferSelect;
export type InsertAudioSession = typeof audioSessions.$inferInsert;
export type ReleaseExercise = typeof releaseExercises.$inferSelect;
export type InsertReleaseExercise = typeof releaseExercises.$inferInsert;
export type MovementExercise = typeof movementExercises.$inferSelect;
export type InsertMovementExercise = typeof movementExercises.$inferInsert;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;
export type AdminReport = typeof adminReports.$inferSelect;
export type InsertAdminReport = typeof adminReports.$inferInsert;
export type FreeResourceAccess = typeof freeResourceAccess.$inferSelect;
export type InsertFreeResourceAccess = typeof freeResourceAccess.$inferInsert;
export type StepContentBlock = typeof stepContentBlocks.$inferSelect;
export type InsertStepContentBlock = typeof stepContentBlocks.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;
export type GroupSession = typeof groupSessions.$inferSelect;
export type InsertGroupSession = typeof groupSessions.$inferInsert;
export type GroupSessionParticipant = typeof groupSessionParticipants.$inferSelect;
export type InsertGroupSessionParticipant = typeof groupSessionParticipants.$inferInsert;
export type GroupSessionPayment = typeof groupSessionPayments.$inferSelect;
export type InsertGroupSessionPayment = typeof groupSessionPayments.$inferInsert;

// Session feedback and ratings
export const sessionFeedback = pgTable("session_feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => groupSessions.id),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating"), // 1-5 stars
  comment: text("comment"),
  feedbackType: varchar("feedback_type"), // session, facilitator, content
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Session summaries
export const sessionSummaries = pgTable("session_summaries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => groupSessions.id),
  aiSummary: text("ai_summary"),
  keyTopics: text("key_topics").array(),
  actionItems: text("action_items").array(),
  nextSteps: text("next_steps"),
  participantCount: integer("participant_count"),
  engagementLevel: varchar("engagement_level"), // high, medium, low
  generatedAt: timestamp("generated_at").defaultNow(),
  distributedAt: timestamp("distributed_at"),
  isDistributed: boolean("is_distributed").default(false),
});

// Notification system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type"), // session_reminder, progress_milestone, feedback_request, session_summary
  title: varchar("title"),
  message: text("message"),
  data: jsonb("data"), // Additional structured data
  isRead: boolean("is_read").default(false),
  isSent: boolean("is_sent").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  sessionReminders: boolean("session_reminders").default(true),
  progressUpdates: boolean("progress_updates").default(true),
  sessionSummaries: boolean("session_summaries").default(true),
  facilitatorMessages: boolean("facilitator_messages").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SessionFeedback = typeof sessionFeedback.$inferSelect;
export type InsertSessionFeedback = typeof sessionFeedback.$inferInsert;
export type SessionSummary = typeof sessionSummaries.$inferSelect;
export type InsertSessionSummary = typeof sessionSummaries.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
export type Facilitator = typeof facilitators.$inferSelect;
export type InsertFacilitator = typeof facilitators.$inferInsert;
export type PremiumFeatureAccess = typeof premiumFeatureAccess.$inferSelect;
export type InsertPremiumFeatureAccess = typeof premiumFeatureAccess.$inferInsert;
