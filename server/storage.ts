import {
  users,
  journeyProgress,
  journalEntries,
  userRatings,
  audioSessions,
  releaseExercises,
  movementExercises,
  freeResourceAccess,
  stepContentBlocks,
  aiConversations,
  aiChatMessages,
  groupSessions,
  groupSessionParticipants,
  groupSessionPayments,
  facilitators,
  premiumFeatureAccess,
  type User,
  type UpsertUser,
  type JourneyProgress,
  type InsertJourneyProgress,
  type JournalEntry,
  type InsertJournalEntry,
  type UserRating,
  type InsertUserRating,
  type AudioSession,
  type InsertAudioSession,
  type ReleaseExercise,
  type InsertReleaseExercise,
  type MovementExercise,
  type InsertMovementExercise,
  type FreeResourceAccess,
  type InsertFreeResourceAccess,
  type StepContentBlock,
  type InsertStepContentBlock,
  type AiConversation,
  type InsertAiConversation,
  type AiChatMessage,
  type InsertAiChatMessage,
  type GroupSession,
  type InsertGroupSession,
  type GroupSessionParticipant,
  type InsertGroupSessionParticipant,
  type GroupSessionPayment,
  type InsertGroupSessionPayment,
  type Facilitator,
  type InsertFacilitator,
  type PremiumFeatureAccess,
  type InsertPremiumFeatureAccess,
  sessionFeedback,
  type SessionFeedback,
  type InsertSessionFeedback,
  sessionSummaries,
  type SessionSummary,
  type InsertSessionSummary,
  notifications,
  type Notification,
  type InsertNotification,
  notificationPreferences,
  type NotificationPreferences,
  type InsertNotificationPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Journey progress operations
  getJourneyProgress(userId: string): Promise<JourneyProgress | undefined>;
  upsertJourneyProgress(progress: InsertJourneyProgress): Promise<JourneyProgress>;
  updateJourneyProgress(userId: string, step: number, completedSteps: number[], overallProgress: number): Promise<JourneyProgress>;
  
  // Journal operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  getJournalEntriesByStep(userId: string, stepNumber: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, content: string): Promise<JournalEntry>;
  
  // Rating operations
  getUserRatings(userId: string): Promise<UserRating[]>;
  createUserRating(rating: InsertUserRating): Promise<UserRating>;
  
  // Audio session operations
  getAudioSessions(userId: string): Promise<AudioSession[]>;
  createAudioSession(session: InsertAudioSession): Promise<AudioSession>;
  updateAudioProgress(id: number, progress: number, completed: boolean): Promise<AudioSession>;
  
  // Release exercise operations
  getReleaseExercises(userId: string): Promise<ReleaseExercise[]>;
  createReleaseExercise(exercise: InsertReleaseExercise): Promise<ReleaseExercise>;
  
  // Movement exercise operations
  getMovementExercises(userId: string): Promise<MovementExercise[]>;
  createMovementExercise(exercise: InsertMovementExercise): Promise<MovementExercise>;
  updateMovementExercise(id: number, completed: boolean): Promise<MovementExercise>;
  
  // Free resource access operations
  getFreeResourceAccess(userId: string): Promise<FreeResourceAccess[]>;
  trackFreeResourceAccess(data: { userId: string; resourceName: string; resourceUrl: string }): Promise<FreeResourceAccess>;
  
  // Admin operations
  getAdminDashboardStats(): Promise<any>;
  getAdminActivity(): Promise<any>;
  getAdminUsers(search: string, role: string, status: string): Promise<any>;
  updateAdminUser(userId: string, updates: any): Promise<User>;
  deactivateUser(userId: string): Promise<User>;
  getAdminReports(): Promise<any>;
  createAdminReport(reportData: any): Promise<any>;
  generateReport(reportId: number): Promise<any>;
  getSystemStatus(): Promise<any>;
  getSystemAlerts(): Promise<any>;
  getSystemMetrics(timeRange: string): Promise<any>;
  getMetricsChartData(type: string, dateRange: string): Promise<any>;
  
  // Free resources operations
  getFreeResourceAccess(userId: string): Promise<FreeResourceAccess[]>;
  trackFreeResourceAccess(access: InsertFreeResourceAccess): Promise<FreeResourceAccess>;
  updateResourceAccessCount(userId: string, resourceName: string): Promise<void>;
  
  // Step content operations  
  getStepContentBlocks(stepNumber: number): Promise<StepContentBlock[]>;
  createStepContentBlock(block: InsertStepContentBlock): Promise<StepContentBlock>;
  updateStepContentBlock(id: number, updates: Partial<StepContentBlock>): Promise<StepContentBlock>;
  
  // Premium AI chatbot operations
  getAiConversations(userId: string): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  getAiChatMessages(conversationId: number): Promise<AiChatMessage[]>;
  createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage>;
  
  // Group session operations
  getUpcomingGroupSessions(): Promise<GroupSession[]>;
  getUserGroupSessions(userId: string): Promise<GroupSession[]>;
  getGroupSessions(): Promise<GroupSession[]>;
  getGroupSessionById(sessionId: number): Promise<GroupSession | undefined>;
  getGroupSessionParticipants(sessionId: number): Promise<GroupSessionParticipant[]>;
  createGroupSession(session: InsertGroupSession): Promise<GroupSession>;
  joinGroupSession(sessionId: number, userId: string, codeName: string): Promise<GroupSessionParticipant>;
  updateGroupSessionAttendance(sessionId: number, userId: string, attended: boolean): Promise<void>;
  bulkUpdateAttendance(sessionId: number, attendanceData: { userId: string; attended: boolean }[]): Promise<void>;
  createGroupSessionPayment(payment: InsertGroupSessionPayment): Promise<GroupSessionPayment>;
  updateGroupSessionPayment(paymentId: number, status: string, paidAt?: Date): Promise<GroupSessionPayment>;
  updateGroupSession(sessionId: number, updates: Partial<GroupSession>): Promise<GroupSession>;
  deleteGroupSession(sessionId: number): Promise<void>;
  
  // Attendance reporting
  getSessionAttendanceReport(sessionId: number): Promise<any>;
  getFacilitatorAttendanceStats(facilitatorId: string): Promise<any>;
  getOverallAttendanceStats(): Promise<any>;
  
  // Session feedback operations
  getSessionFeedback(sessionId: number): Promise<SessionFeedback[]>;
  createSessionFeedback(feedback: InsertSessionFeedback): Promise<SessionFeedback>;
  getFacilitatorFeedbackStats(facilitatorId: string): Promise<any>;
  
  // Session summary operations
  getSessionSummary(sessionId: number): Promise<SessionSummary | undefined>;
  createSessionSummary(summary: InsertSessionSummary): Promise<SessionSummary>;
  markSummaryAsDistributed(summaryId: number): Promise<void>;
  getSessionSummaries(facilitatorId?: string): Promise<SessionSummary[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markNotificationAsSent(notificationId: number): Promise<void>;
  
  // Notification preferences
  getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
  
  // Facilitator operations
  getFacilitatorById(facilitatorId: string): Promise<Facilitator | undefined>;
  
  // Facilitator management
  getFacilitators(): Promise<Facilitator[]>;
  createFacilitator(facilitator: InsertFacilitator): Promise<Facilitator>;
  updateFacilitator(facilitatorId: number, updates: Partial<Facilitator>): Promise<Facilitator>;
  deleteFacilitator(facilitatorId: number): Promise<void>;
  
  // Premium feature tracking
  trackPremiumFeatureAccess(userId: string, featureName: string): Promise<void>;
  getPremiumFeatureAccess(userId: string): Promise<PremiumFeatureAccess[]>;
  
  // Subscription checking
  isUserPremium(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: stripeSubscriptionId ? 'active' : 'free',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Journey progress operations
  async getJourneyProgress(userId: string): Promise<JourneyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(journeyProgress)
      .where(eq(journeyProgress.userId, userId));
    return progress;
  }

  async upsertJourneyProgress(progressData: InsertJourneyProgress): Promise<JourneyProgress> {
    const [progress] = await db
      .insert(journeyProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: journeyProgress.userId,
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async updateJourneyProgress(userId: string, step: number, completedSteps: number[], overallProgress: number): Promise<JourneyProgress> {
    const [progress] = await db
      .update(journeyProgress)
      .set({
        currentStep: step,
        completedSteps: JSON.stringify(completedSteps),
        overallProgress,
        updatedAt: new Date(),
      })
      .where(eq(journeyProgress.userId, userId))
      .returning();
    return progress;
  }

  // Journal operations
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntriesByStep(userId: string, stepNumber: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.stepNumber, stepNumber)))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateJournalEntry(id: number, content: string): Promise<JournalEntry> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ content, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry;
  }

  // Rating operations
  async getUserRatings(userId: string): Promise<UserRating[]> {
    return await db
      .select()
      .from(userRatings)
      .where(eq(userRatings.userId, userId))
      .orderBy(desc(userRatings.createdAt));
  }

  async createUserRating(rating: InsertUserRating): Promise<UserRating> {
    const [newRating] = await db
      .insert(userRatings)
      .values(rating)
      .returning();
    return newRating;
  }

  // Audio session operations
  async getAudioSessions(userId: string): Promise<AudioSession[]> {
    return await db
      .select()
      .from(audioSessions)
      .where(eq(audioSessions.userId, userId))
      .orderBy(desc(audioSessions.createdAt));
  }

  async createAudioSession(session: InsertAudioSession): Promise<AudioSession> {
    const [newSession] = await db
      .insert(audioSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateAudioProgress(id: number, progress: number, completed: boolean): Promise<AudioSession> {
    const [updatedSession] = await db
      .update(audioSessions)
      .set({ progress, completed, updatedAt: new Date() })
      .where(eq(audioSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Release exercise operations
  async getReleaseExercises(userId: string): Promise<ReleaseExercise[]> {
    return await db
      .select()
      .from(releaseExercises)
      .where(eq(releaseExercises.userId, userId))
      .orderBy(desc(releaseExercises.createdAt));
  }

  async createReleaseExercise(exercise: InsertReleaseExercise): Promise<ReleaseExercise> {
    const [newExercise] = await db
      .insert(releaseExercises)
      .values(exercise)
      .returning();
    return newExercise;
  }

  // Movement exercise operations
  async getMovementExercises(userId: string): Promise<MovementExercise[]> {
    return await db
      .select()
      .from(movementExercises)
      .where(eq(movementExercises.userId, userId))
      .orderBy(desc(movementExercises.createdAt));
  }

  async createMovementExercise(exercise: InsertMovementExercise): Promise<MovementExercise> {
    const [newExercise] = await db
      .insert(movementExercises)
      .values(exercise)
      .returning();
    return newExercise;
  }

  async updateMovementExercise(id: number, completed: boolean): Promise<MovementExercise> {
    const [updatedExercise] = await db
      .update(movementExercises)
      .set({ completed })
      .where(eq(movementExercises.id, id))
      .returning();
    return updatedExercise;
  }

  // Admin operations
  async getAdminDashboardStats(): Promise<any> {
    const [totalUsers] = await db.select({ count: users.id }).from(users);
    const [activeUsers] = await db.select({ count: users.id }).from(users).where(eq(users.role, 'user'));
    const [premiumUsers] = await db.select({ count: users.id }).from(users).where(eq(users.subscriptionStatus, 'active'));
    
    return {
      totalUsers: totalUsers?.count || 0,
      activeUsers: activeUsers?.count || 0,
      premiumUsers: premiumUsers?.count || 0,
      systemHealth: 'healthy',
      revenue: 5420.00,
      conversionRate: 12.3
    };
  }

  async getAdminActivity(): Promise<any> {
    const activities = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        lastActive: users.updatedAt,
        action: users.role
      })
      .from(users)
      .orderBy(desc(users.updatedAt))
      .limit(10);

    return activities.map(activity => ({
      id: activity.id,
      user: `${activity.firstName || ''} ${activity.lastName || ''}`.trim() || activity.email,
      action: `Updated profile`,
      timestamp: activity.lastActive,
      type: 'user_activity'
    }));
  }

  async getAdminUsers(search: string, role: string, status: string): Promise<any> {
    let conditions = [];
    
    if (search) {
      conditions.push(eq(users.email, search));
    }
    
    if (role !== 'all') {
      conditions.push(eq(users.role, role));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(desc(users.createdAt));
    } else {
      return await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
    }
  }

  async updateAdminUser(userId: string, updates: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deactivateUser(userId: string): Promise<User> {
    const [deactivatedUser] = await db
      .update(users)
      .set({ role: 'deactivated' })
      .where(eq(users.id, userId))
      .returning();
    return deactivatedUser;
  }

  async getAdminReports(): Promise<any> {
    return [
      {
        id: 1,
        title: 'User Engagement Report',
        type: 'user_engagement',
        description: 'Monthly user activity and engagement metrics',
        createdAt: new Date(),
        status: 'completed'
      },
      {
        id: 2,
        title: 'Revenue Analytics',
        type: 'revenue',
        description: 'Subscription revenue and conversion analysis',
        createdAt: new Date(),
        status: 'pending'
      }
    ];
  }

  async createAdminReport(reportData: any): Promise<any> {
    return {
      id: Date.now(),
      ...reportData,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  async generateReport(reportId: number): Promise<any> {
    return {
      id: reportId,
      data: 'Generated report data',
      generatedAt: new Date()
    };
  }

  async getSystemStatus(): Promise<any> {
    return {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms'
    };
  }

  async getSystemAlerts(): Promise<any> {
    return [
      {
        id: 1,
        type: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date(),
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        message: 'System maintenance scheduled',
        timestamp: new Date(),
        resolved: true
      }
    ];
  }

  async getSystemMetrics(timeRange: string): Promise<any> {
    const now = new Date();
    const data = [];
    
    // Generate mock metrics data based on time range
    for (let i = 0; i < 24; i++) {
      data.push({
        timestamp: new Date(now.getTime() - i * 60 * 60 * 1000),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 10)
      });
    }
    
    return data.reverse();
  }

  async getMetricsChartData(type: string, dateRange: string): Promise<any> {
    const now = new Date();
    const data = [];
    
    // Generate chart data based on type and date range
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 1000),
        label: `Day ${i + 1}`
      });
    }
    
    return data.reverse();
  }

  // Free resources operations
  async getFreeResourceAccess(userId: string): Promise<FreeResourceAccess[]> {
    return await db
      .select()
      .from(freeResourceAccess)
      .where(eq(freeResourceAccess.userId, userId))
      .orderBy(desc(freeResourceAccess.lastAccessedAt));
  }

  async trackFreeResourceAccess(data: { userId: string; resourceName: string; resourceUrl: string }): Promise<FreeResourceAccess> {
    // Check if resource access already exists
    const existing = await db
      .select()
      .from(freeResourceAccess)
      .where(
        and(
          eq(freeResourceAccess.userId, data.userId),
          eq(freeResourceAccess.resourceName, data.resourceName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(freeResourceAccess)
        .set({
          accessCount: existing[0].accessCount + 1,
          lastAccessedAt: new Date(),
        })
        .where(eq(freeResourceAccess.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(freeResourceAccess)
        .values({
          userId: data.userId,
          resourceName: data.resourceName,
          resourceUrl: data.resourceUrl,
          accessCount: 1,
          firstAccessedAt: new Date(),
          lastAccessedAt: new Date(),
        })
        .returning();
      return created;
    }
  }

  // Step content operations
  async getStepContentBlocks(stepNumber: number): Promise<StepContentBlock[]> {
    return await db
      .select()
      .from(stepContentBlocks)
      .where(
        and(
          eq(stepContentBlocks.stepNumber, stepNumber),
          eq(stepContentBlocks.isActive, true)
        )
      )
      .orderBy(stepContentBlocks.position);
  }

  async createStepContentBlock(block: InsertStepContentBlock): Promise<StepContentBlock> {
    const [newBlock] = await db
      .insert(stepContentBlocks)
      .values(block)
      .returning();
    return newBlock;
  }

  async updateStepContentBlock(id: number, updates: Partial<StepContentBlock>): Promise<StepContentBlock> {
    const [updatedBlock] = await db
      .update(stepContentBlocks)
      .set(updates)
      .where(eq(stepContentBlocks.id, id))
      .returning();
    return updatedBlock;
  }

  // Premium AI chatbot operations
  async getAiConversations(userId: string): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(and(eq(aiConversations.userId, userId), eq(aiConversations.isActive, true)))
      .orderBy(desc(aiConversations.updatedAt));
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db
      .insert(aiConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getAiChatMessages(conversationId: number): Promise<AiChatMessage[]> {
    return await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, conversationId))
      .orderBy(aiChatMessages.createdAt);
  }

  async createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage> {
    const [newMessage] = await db
      .insert(aiChatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Group session operations
  async getUpcomingGroupSessions(): Promise<GroupSession[]> {
    const now = new Date();
    return await db
      .select()
      .from(groupSessions)
      .where(
        and(
          eq(groupSessions.status, "scheduled"),
          // scheduledTime > now (future sessions)
        )
      )
      .orderBy(groupSessions.scheduledTime);
  }

  async getUserGroupSessions(userId: string): Promise<GroupSession[]> {
    return await db
      .select({
        id: groupSessions.id,
        title: groupSessions.title,
        description: groupSessions.description,
        facilitatorId: groupSessions.facilitatorId,
        scheduledTime: groupSessions.scheduledTime,
        maxParticipants: groupSessions.maxParticipants,
        currentParticipants: groupSessions.currentParticipants,
        sessionType: groupSessions.sessionType,
        status: groupSessions.status,
        meetingLink: groupSessions.meetingLink,
        sessionNotes: groupSessions.sessionNotes,
        createdAt: groupSessions.createdAt,
        updatedAt: groupSessions.updatedAt,
      })
      .from(groupSessions)
      .innerJoin(groupSessionParticipants, eq(groupSessions.id, groupSessionParticipants.sessionId))
      .where(eq(groupSessionParticipants.userId, userId))
      .orderBy(desc(groupSessions.scheduledTime));
  }

  async createGroupSession(session: InsertGroupSession): Promise<GroupSession> {
    const [newSession] = await db
      .insert(groupSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async joinGroupSession(sessionId: number, userId: string, codeName: string): Promise<GroupSessionParticipant> {
    const [participant] = await db
      .insert(groupSessionParticipants)
      .values({
        sessionId,
        userId,
        codeName,
      })
      .returning();

    // Update participant count
    await db
      .update(groupSessions)
      .set({
        currentParticipants: db.$count(groupSessionParticipants, eq(groupSessionParticipants.sessionId, sessionId))
      })
      .where(eq(groupSessions.id, sessionId));

    return participant;
  }

  async createGroupSessionPayment(payment: InsertGroupSessionPayment): Promise<GroupSessionPayment> {
    const [newPayment] = await db
      .insert(groupSessionPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updateGroupSessionPayment(paymentId: number, status: string, paidAt?: Date): Promise<GroupSessionPayment> {
    const [updatedPayment] = await db
      .update(groupSessionPayments)
      .set({ status, paidAt })
      .where(eq(groupSessionPayments.id, paymentId))
      .returning();
    return updatedPayment;
  }

  async updateGroupSession(sessionId: number, updates: Partial<GroupSession>): Promise<GroupSession> {
    const [updatedSession] = await db
      .update(groupSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groupSessions.id, sessionId))
      .returning();
    return updatedSession;
  }

  async deleteGroupSession(sessionId: number): Promise<void> {
    // First delete related participants and payments
    await db.delete(groupSessionParticipants).where(eq(groupSessionParticipants.sessionId, sessionId));
    await db.delete(groupSessionPayments).where(eq(groupSessionPayments.sessionId, sessionId));
    
    // Then delete the session
    await db.delete(groupSessions).where(eq(groupSessions.id, sessionId));
  }

  // Facilitator management methods
  async getFacilitators(): Promise<Facilitator[]> {
    return await db.select().from(facilitators).where(eq(facilitators.isActive, true)).orderBy(facilitators.name);
  }

  async createFacilitator(facilitatorData: InsertFacilitator): Promise<Facilitator> {
    const [newFacilitator] = await db
      .insert(facilitators)
      .values(facilitatorData)
      .returning();
    return newFacilitator;
  }

  async updateFacilitator(facilitatorId: number, updates: Partial<Facilitator>): Promise<Facilitator> {
    const [updatedFacilitator] = await db
      .update(facilitators)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(facilitators.id, facilitatorId))
      .returning();
    return updatedFacilitator;
  }

  async deleteFacilitator(facilitatorId: number): Promise<void> {
    // Soft delete by setting isActive to false
    await db
      .update(facilitators)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(facilitators.id, facilitatorId));
  }

  // Additional group session methods for attendance tracking
  async getGroupSessionById(sessionId: number): Promise<GroupSession | undefined> {
    const [session] = await db.select().from(groupSessions).where(eq(groupSessions.id, sessionId));
    return session;
  }

  async getGroupSessionParticipants(sessionId: number): Promise<GroupSessionParticipant[]> {
    return await db
      .select()
      .from(groupSessionParticipants)
      .where(eq(groupSessionParticipants.sessionId, sessionId))
      .orderBy(groupSessionParticipants.registeredAt);
  }

  async bulkUpdateAttendance(sessionId: number, attendanceData: { userId: string; attended: boolean }[]): Promise<void> {
    for (const { userId, attended } of attendanceData) {
      await db
        .update(groupSessionParticipants)
        .set({ attended })
        .where(
          and(
            eq(groupSessionParticipants.sessionId, sessionId),
            eq(groupSessionParticipants.userId, userId)
          )
        );
    }
  }

  // Attendance reporting methods
  async getSessionAttendanceReport(sessionId: number): Promise<any> {
    const participants = await this.getGroupSessionParticipants(sessionId);
    const session = await this.getGroupSessionById(sessionId);
    
    const totalRegistered = participants.length;
    const attended = participants.filter(p => p.attended).length;
    const attendanceRate = totalRegistered > 0 ? (attended / totalRegistered) * 100 : 0;

    return {
      sessionId,
      sessionTitle: session?.title || 'Unknown Session',
      sessionDate: session?.scheduledDate,
      totalRegistered,
      attended,
      noShows: totalRegistered - attended,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      participants: participants.map(p => ({
        userId: p.userId,
        codeName: p.codeName,
        attended: p.attended,
        registeredAt: p.registeredAt,
        feedbackRating: p.feedbackRating,
        feedbackComment: p.feedbackComment
      }))
    };
  }

  async getFacilitatorAttendanceStats(facilitatorId: string): Promise<any> {
    const sessions = await db
      .select()
      .from(groupSessions)
      .where(eq(groupSessions.facilitatorId, facilitatorId));

    let totalSessions = 0;
    let totalRegistered = 0;
    let totalAttended = 0;

    for (const session of sessions) {
      const participants = await this.getGroupSessionParticipants(session.id);
      totalSessions++;
      totalRegistered += participants.length;
      totalAttended += participants.filter(p => p.attended).length;
    }

    const avgAttendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

    return {
      facilitatorId,
      totalSessions,
      totalRegistered,
      totalAttended,
      avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        date: s.scheduledDate,
        status: s.status
      }))
    };
  }

  async getOverallAttendanceStats(): Promise<any> {
    const allSessions = await db.select().from(groupSessions);
    const allParticipants = await db.select().from(groupSessionParticipants);

    const totalSessions = allSessions.length;
    const totalRegistered = allParticipants.length;
    const totalAttended = allParticipants.filter(p => p.attended).length;
    const overallAttendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;

    // Group by session type
    const sessionTypeStats = allSessions.reduce((acc, session) => {
      const type = session.sessionType || 'unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, registered: 0, attended: 0 };
      }
      acc[type].count++;
      
      const sessionParticipants = allParticipants.filter(p => p.sessionId === session.id);
      acc[type].registered += sessionParticipants.length;
      acc[type].attended += sessionParticipants.filter(p => p.attended).length;
      
      return acc;
    }, {} as any);

    return {
      totalSessions,
      totalRegistered,
      totalAttended,
      overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100,
      sessionTypeStats,
      recentSessions: allSessions
        .slice(-10)
        .map(s => ({
          id: s.id,
          title: s.title,
          date: s.scheduledDate,
          type: s.sessionType,
          status: s.status
        }))
    };
  }

  async updateGroupSessionAttendance(sessionId: number, userId: string, attended: boolean): Promise<void> {
    await db
      .update(groupSessionParticipants)
      .set({ attended })
      .where(
        and(
          eq(groupSessionParticipants.sessionId, sessionId),
          eq(groupSessionParticipants.userId, userId)
        )
      );
  }

  // Premium feature tracking
  async trackPremiumFeatureAccess(userId: string, featureName: string): Promise<void> {
    const existingAccess = await db
      .select()
      .from(premiumFeatureAccess)
      .where(
        and(
          eq(premiumFeatureAccess.userId, userId),
          eq(premiumFeatureAccess.featureName, featureName)
        )
      )
      .limit(1);

    if (existingAccess.length > 0) {
      await db
        .update(premiumFeatureAccess)
        .set({
          accessCount: existingAccess[0].accessCount + 1,
          lastAccessedAt: new Date(),
        })
        .where(eq(premiumFeatureAccess.id, existingAccess[0].id));
    } else {
      await db
        .insert(premiumFeatureAccess)
        .values({
          userId,
          featureName,
          accessCount: 1,
        });
    }
  }

  async getPremiumFeatureAccess(userId: string): Promise<PremiumFeatureAccess[]> {
    return await db
      .select()
      .from(premiumFeatureAccess)
      .where(eq(premiumFeatureAccess.userId, userId))
      .orderBy(desc(premiumFeatureAccess.lastAccessedAt));
  }

  // Subscription checking
  async isUserPremium(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";
  }

  // Session feedback operations
  async getSessionFeedback(sessionId: number): Promise<SessionFeedback[]> {
    return await db
      .select()
      .from(sessionFeedback)
      .where(eq(sessionFeedback.sessionId, sessionId))
      .orderBy(desc(sessionFeedback.createdAt));
  }

  async createSessionFeedback(feedback: InsertSessionFeedback): Promise<SessionFeedback> {
    const [newFeedback] = await db
      .insert(sessionFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getFacilitatorFeedbackStats(facilitatorId: string): Promise<any> {
    const facilitatorSessions = await db
      .select()
      .from(groupSessions)
      .where(eq(groupSessions.facilitatorId, facilitatorId));

    let totalRatings = 0;
    let ratingSum = 0;
    let feedbackCount = 0;

    for (const session of facilitatorSessions) {
      const feedback = await this.getSessionFeedback(session.id);
      const ratings = feedback.filter(f => f.rating !== null);
      
      totalRatings += ratings.length;
      ratingSum += ratings.reduce((sum, f) => sum + (f.rating || 0), 0);
      feedbackCount += feedback.length;
    }

    const avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0;

    return {
      facilitatorId,
      totalSessions: facilitatorSessions.length,
      avgRating: Math.round(avgRating * 100) / 100,
      totalFeedback: feedbackCount,
      totalRatings
    };
  }

  // Session summary operations
  async getSessionSummary(sessionId: number): Promise<SessionSummary | undefined> {
    const [summary] = await db
      .select()
      .from(sessionSummaries)
      .where(eq(sessionSummaries.sessionId, sessionId));
    return summary;
  }

  async createSessionSummary(summary: InsertSessionSummary): Promise<SessionSummary> {
    const [newSummary] = await db
      .insert(sessionSummaries)
      .values(summary)
      .returning();
    return newSummary;
  }

  async markSummaryAsDistributed(summaryId: number): Promise<void> {
    await db
      .update(sessionSummaries)
      .set({
        isDistributed: true,
        distributedAt: new Date()
      })
      .where(eq(sessionSummaries.id, summaryId));
  }

  async getSessionSummaries(facilitatorId?: string): Promise<SessionSummary[]> {
    if (facilitatorId) {
      return await db
        .select({
          id: sessionSummaries.id,
          sessionId: sessionSummaries.sessionId,
          aiSummary: sessionSummaries.aiSummary,
          keyTopics: sessionSummaries.keyTopics,
          actionItems: sessionSummaries.actionItems,
          nextSteps: sessionSummaries.nextSteps,
          participantCount: sessionSummaries.participantCount,
          engagementLevel: sessionSummaries.engagementLevel,
          generatedAt: sessionSummaries.generatedAt,
          distributedAt: sessionSummaries.distributedAt,
          isDistributed: sessionSummaries.isDistributed,
        })
        .from(sessionSummaries)
        .innerJoin(groupSessions, eq(sessionSummaries.sessionId, groupSessions.id))
        .where(eq(groupSessions.facilitatorId, facilitatorId))
        .orderBy(desc(sessionSummaries.generatedAt));
    }

    return await db
      .select()
      .from(sessionSummaries)
      .orderBy(desc(sessionSummaries.generatedAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }

    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markNotificationAsSent(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isSent: true,
        sentAt: new Date()
      })
      .where(eq(notifications.id, notificationId));
  }

  // Notification preferences
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const [updated] = await db
      .insert(notificationPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }

  // Additional facilitator operations
  async getFacilitatorById(facilitatorId: string): Promise<Facilitator | undefined> {
    const [facilitator] = await db
      .select()
      .from(facilitators)
      .where(eq(facilitators.id, parseInt(facilitatorId)));
    return facilitator;
  }
}

export const storage = new DatabaseStorage();
