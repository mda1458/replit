import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertJournalEntrySchema, insertUserRatingSchema, insertReleaseExerciseSchema, insertMovementExerciseSchema, insertAiConversationSchema, insertAiChatMessageSchema, insertGroupSessionSchema, insertGroupSessionParticipantSchema } from "@shared/schema";
import { z } from "zod";
import { generateAIResponse, generateStepGuidance, detectCrisisLanguage } from "./openai";
import Stripe from "stripe";
import { nanoid } from "nanoid";

// Initialize Stripe if keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Premium middleware to check subscription status
const isPremium = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const userId = req.user.claims.sub;
    const isPremiumUser = await storage.isUserPremium(userId);
    
    if (!isPremiumUser) {
      return res.status(403).json({ 
        message: "Premium subscription required",
        upgradeUrl: "/subscribe"
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking premium status:", error);
    res.status(500).json({ message: "Failed to verify subscription" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: 'v2025.01.19.v3'
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Journey progress routes
  app.get('/api/journey/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getJourneyProgress(userId);
      
      if (!progress) {
        // Initialize progress for new user
        const newProgress = await storage.upsertJourneyProgress({
          userId,
          currentStep: 1,
          completedSteps: JSON.stringify([]),
          overallProgress: 0,
        });
        res.json(newProgress);
      } else {
        res.json(progress);
      }
    } catch (error) {
      console.error("Error fetching journey progress:", error);
      res.status(500).json({ message: "Failed to fetch journey progress" });
    }
  });

  app.post('/api/journey/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { step, completedSteps, overallProgress } = req.body;
      
      const progress = await storage.updateJourneyProgress(userId, step, completedSteps, overallProgress);
      res.json(progress);
    } catch (error) {
      console.error("Error updating journey progress:", error);
      res.status(500).json({ message: "Failed to update journey progress" });
    }
  });

  // Journal entry routes
  app.get('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { step } = req.query;
      
      let entries;
      if (step) {
        entries = await storage.getJournalEntriesByStep(userId, parseInt(step as string));
      } else {
        entries = await storage.getJournalEntries(userId);
      }
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.patch('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const entry = await storage.updateJournalEntry(parseInt(id), content);
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  // User rating routes
  app.get('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ratingData = insertUserRatingSchema.parse({
        ...req.body,
        userId,
      });
      
      const rating = await storage.createUserRating(ratingData);
      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Audio session routes
  app.get('/api/audio/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getAudioSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching audio sessions:", error);
      res.status(500).json({ message: "Failed to fetch audio sessions" });
    }
  });

  app.post('/api/audio/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = {
        ...req.body,
        userId,
      };
      
      const session = await storage.createAudioSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating audio session:", error);
      res.status(500).json({ message: "Failed to create audio session" });
    }
  });

  app.patch('/api/audio/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { progress, completed } = req.body;
      
      const session = await storage.updateAudioProgress(parseInt(id), progress, completed);
      res.json(session);
    } catch (error) {
      console.error("Error updating audio session:", error);
      res.status(500).json({ message: "Failed to update audio session" });
    }
  });

  // Release exercise routes
  app.get('/api/release/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exercises = await storage.getReleaseExercises(userId);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching release exercises:", error);
      res.status(500).json({ message: "Failed to fetch release exercises" });
    }
  });

  app.post('/api/release/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exerciseData = insertReleaseExerciseSchema.parse({
        ...req.body,
        userId,
      });
      
      const exercise = await storage.createReleaseExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      console.error("Error creating release exercise:", error);
      res.status(500).json({ message: "Failed to create release exercise" });
    }
  });

  // Movement exercise routes
  app.get('/api/movement/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exercises = await storage.getMovementExercises(userId);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching movement exercises:", error);
      res.status(500).json({ message: "Failed to fetch movement exercises" });
    }
  });

  app.post('/api/movement/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exerciseData = insertMovementExerciseSchema.parse({
        ...req.body,
        userId,
      });
      
      const exercise = await storage.createMovementExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      console.error("Error creating movement exercise:", error);
      res.status(500).json({ message: "Failed to create movement exercise" });
    }
  });

  app.patch('/api/movement/exercises/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      
      const exercise = await storage.updateMovementExercise(parseInt(id), completed);
      res.json(exercise);
    } catch (error) {
      console.error("Error updating movement exercise:", error);
      res.status(500).json({ message: "Failed to update movement exercise" });
    }
  });

  // RELEASE methodology data
  app.get('/api/release/steps', (req, res) => {
    const steps = [
      {
        id: 1,
        letter: 'R',
        title: 'Recognize',
        description: 'Inner unforgiveness patterns',
        longDescription: 'Recognize and acknowledge the inner unforgiveness patterns that are holding you back.',
        exercises: [
          'Identify specific hurts or resentments',
          'Notice physical sensations of anger',
          'Acknowledge the emotional weight you carry'
        ]
      },
      {
        id: 2,
        letter: 'E',
        title: 'Empathize',
        description: 'With all perspectives',
        longDescription: 'Empathize with all sides of the situation, including your own and others\' perspectives.',
        exercises: [
          'Consider the other person\'s viewpoint',
          'Understand your own emotional responses',
          'Practice compassionate understanding'
        ]
      },
      {
        id: 3,
        letter: 'L',
        title: 'Let Go',
        description: 'Release the emotional burden',
        longDescription: 'Let go of the emotional burden and release your attachment to the hurt.',
        exercises: [
          'Practice letting go meditation',
          'Write and release exercise',
          'Symbolic release ceremony'
        ]
      },
      {
        id: 4,
        letter: 'E',
        title: 'Elect',
        description: 'New responses',
        longDescription: 'Elect new responses and choose how you want to react differently in the future.',
        exercises: [
          'Choose new behavioral patterns',
          'Practice mindful responses',
          'Develop healthy coping strategies'
        ]
      },
      {
        id: 5,
        letter: 'A',
        title: 'Accept',
        description: 'Continual practice',
        longDescription: 'Accept that forgiveness is a continual practice and commitment to growth.',
        exercises: [
          'Establish daily forgiveness practices',
          'Accept setbacks as part of the journey',
          'Commit to ongoing healing'
        ]
      },
      {
        id: 6,
        letter: 'S',
        title: 'Sustain',
        description: 'Gratitude of release',
        longDescription: 'Sustain the gratitude of release and appreciate the freedom you\'ve gained.',
        exercises: [
          'Practice daily gratitude',
          'Celebrate your progress',
          'Acknowledge your strength'
        ]
      },
      {
        id: 7,
        letter: 'E',
        title: 'Enjoy',
        description: 'The freedom of forgiveness',
        longDescription: 'Enjoy the freedom of forgiveness and live fully in your new emotional state.',
        exercises: [
          'Embrace your emotional freedom',
          'Live with presence and joy',
          'Share your journey with others'
        ]
      }
    ];
    
    res.json(steps);
  });

  // Free Resources API routes
  app.get("/api/free-resources/access", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accessData = await storage.getFreeResourceAccess(userId);
      res.json(accessData);
    } catch (error) {
      console.error("Error fetching resource access:", error);
      res.status(500).json({ message: "Failed to fetch resource access data" });
    }
  });

  app.post("/api/free-resources/access", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { resourceName, resourceUrl } = req.body;
      
      if (!resourceName || !resourceUrl) {
        return res.status(400).json({ message: "Resource name and URL are required" });
      }

      const accessRecord = await storage.trackFreeResourceAccess({
        userId,
        resourceName,
        resourceUrl
      });
      
      res.json(accessRecord);
    } catch (error) {
      console.error("Error tracking resource access:", error);
      res.status(500).json({ message: "Failed to track resource access" });
    }
  });

  app.post('/api/free-resources/:resourceName/access', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { resourceName } = req.params;
      const { resourceUrl } = req.body;
      
      const access = await storage.trackFreeResourceAccess({
        userId,
        resourceName,
        resourceUrl,
      });
      
      res.json(access);
    } catch (error) {
      console.error("Error tracking resource access:", error);
      res.status(500).json({ message: "Failed to track resource access" });
    }
  });

  // Step content blocks routes
  app.get('/api/steps/:stepNumber/content', async (req: any, res) => {
    try {
      const { stepNumber } = req.params;
      const contentBlocks = await storage.getStepContentBlocks(parseInt(stepNumber));
      res.json(contentBlocks);
    } catch (error) {
      console.error("Error fetching step content:", error);
      res.status(500).json({ message: "Failed to fetch step content" });
    }
  });

  // Admin middleware to check admin privileges
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.claims?.role !== 'admin' && req.user?.claims?.role !== 'super_admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // Admin dashboard statistics
  app.get('/api/admin/dashboard/stats', isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/dashboard/activity', isAdmin, async (req: any, res) => {
    try {
      const activity = await storage.getAdminActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching admin activity:", error);
      res.status(500).json({ message: "Failed to fetch admin activity" });
    }
  });

  // Admin user management
  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const { search = '', role = 'all', status = 'all' } = req.query;
      const users = await storage.getAdminUsers(search, role, status);
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:userId', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      const user = await storage.updateAdminUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/admin/users/:userId/deactivate', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.deactivateUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Admin reports
  app.get('/api/admin/reports', isAdmin, async (req: any, res) => {
    try {
      const reports = await storage.getAdminReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching admin reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/admin/reports', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const reportData = {
        ...req.body,
        createdBy: adminId,
      };
      const report = await storage.createAdminReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating admin report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.post('/api/admin/reports/:reportId/generate', isAdmin, async (req: any, res) => {
    try {
      const { reportId } = req.params;
      const reportData = await storage.generateReport(parseInt(reportId));
      
      // Return mock PDF data for now
      const mockPDF = Buffer.from('Mock PDF Report Data');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.pdf`);
      res.send(mockPDF);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Admin monitoring
  app.get('/api/admin/monitoring/status', isAdmin, async (req: any, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  app.get('/api/admin/monitoring/alerts', isAdmin, async (req: any, res) => {
    try {
      const alerts = await storage.getSystemAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching system alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get('/api/admin/monitoring/metrics', isAdmin, async (req: any, res) => {
    try {
      const { timeRange = '1h' } = req.query;
      const metrics = await storage.getSystemMetrics(timeRange);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/admin/metrics/chart', isAdmin, async (req: any, res) => {
    try {
      const { type, dateRange = '30d' } = req.query;
      const chartData = await storage.getMetricsChartData(type, dateRange);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Premium AI Chatbot routes
  app.get('/api/ai/conversations', isPremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.trackPremiumFeatureAccess(userId, 'ai_chatbot');
      
      const conversations = await storage.getAiConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/conversations', isPremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, stepNumber } = req.body;
      
      const conversation = await storage.createAiConversation({
        userId,
        sessionId: nanoid(),
        title: title || "Forgiveness Chat",
        stepNumber: stepNumber || null,
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/ai/conversations/:conversationId/messages', isPremium, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getAiChatMessages(parseInt(conversationId));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/ai/conversations/:conversationId/messages', isPremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId } = req.params;
      const { content, stepNumber } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Get user for context
      const user = await storage.getUser(userId);
      const codeName = user?.codeName || "Unknown";

      // Check for crisis language
      const isCrisis = await detectCrisisLanguage(content);
      
      // Save user message
      const userMessage = await storage.createAiChatMessage({
        conversationId: parseInt(conversationId),
        role: 'user',
        content: content.trim(),
        metadata: JSON.stringify({ stepNumber, codeName }),
      });

      // Get conversation history for context
      const previousMessages = await storage.getAiChatMessages(parseInt(conversationId));
      const conversationHistory = previousMessages
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Generate AI response
      const aiResponse = await generateAIResponse(
        conversationHistory,
        {
          currentStep: stepNumber,
          codeName,
          previousJournalEntries: [], // Could be enhanced later
        }
      );

      // Save AI response
      const assistantMessage = await storage.createAiChatMessage({
        conversationId: parseInt(conversationId),
        role: 'assistant',
        content: aiResponse.content,
        metadata: JSON.stringify({ 
          needsCrisisSupport: aiResponse.needsCrisisSupport,
          stepSuggestion: aiResponse.stepSuggestion,
          exerciseSuggestion: aiResponse.exerciseSuggestion,
        }),
      });

      res.json({
        userMessage,
        assistantMessage,
        needsCrisisSupport: aiResponse.needsCrisisSupport || isCrisis,
        stepSuggestion: aiResponse.stepSuggestion,
        exerciseSuggestion: aiResponse.exerciseSuggestion,
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Group Sessions routes
  app.get('/api/group-sessions/upcoming', isPremium, async (req: any, res) => {
    try {
      const sessions = await storage.getUpcomingGroupSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/group-sessions/my-sessions', isPremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserGroupSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  app.post('/api/group-sessions/:sessionId/join', isPremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.params;
      const { codeName } = req.body;
      
      if (!codeName) {
        return res.status(400).json({ message: "Code name is required for group session registration" });
      }
      
      await storage.trackPremiumFeatureAccess(userId, 'group_sessions');
      const participant = await storage.joinGroupSession(parseInt(sessionId), userId, codeName);
      
      res.json(participant);
    } catch (error) {
      console.error("Error joining group session:", error);
      res.status(500).json({ message: "Failed to join session" });
    }
  });

  // Create payment intent for paid group sessions
  app.post('/api/group-sessions/:sessionId/create-payment', isPremium, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured" });
    }

    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.params;
      
      // Get session details
      const sessions = await storage.getUpcomingGroupSessions();
      const session = sessions.find(s => s.id === parseInt(sessionId));
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (!session.sessionFee || parseFloat(session.sessionFee) === 0) {
        return res.status(400).json({ message: "This session is free, no payment required" });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(session.sessionFee) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          sessionId: sessionId,
          userId: userId,
          sessionTitle: session.title,
        },
      });

      // Create payment record
      const payment = await storage.createGroupSessionPayment({
        sessionId: parseInt(sessionId),
        userId,
        paymentIntentId: paymentIntent.id,
        amount: session.sessionFee,
        status: 'pending',
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount: session.sessionFee,
      });

    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Admin routes for group session management
  app.get('/api/admin/group-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getUpcomingGroupSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching admin sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post('/api/admin/group-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = req.body;
      const newSession = await storage.createGroupSession({
        ...sessionData,
        scheduledTime: new Date(sessionData.scheduledTime),
        currentParticipants: 0,
        status: 'scheduled'
      });
      res.json(newSession);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.patch('/api/admin/group-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      if (updates.scheduledTime) {
        updates.scheduledTime = new Date(updates.scheduledTime);
      }
      
      const updatedSession = await storage.updateGroupSession(parseInt(sessionId), updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.delete('/api/admin/group-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteGroupSession(parseInt(sessionId));
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Facilitator management routes
  app.get('/api/admin/facilitators', isAuthenticated, async (req: any, res) => {
    try {
      const facilitators = await storage.getFacilitators();
      res.json(facilitators);
    } catch (error) {
      console.error("Error fetching facilitators:", error);
      res.status(500).json({ message: "Failed to fetch facilitators" });
    }
  });

  app.post('/api/admin/facilitators', isAuthenticated, async (req: any, res) => {
    try {
      const facilitatorData = req.body;
      const newFacilitator = await storage.createFacilitator(facilitatorData);
      res.json(newFacilitator);
    } catch (error) {
      console.error("Error creating facilitator:", error);
      res.status(500).json({ message: "Failed to create facilitator" });
    }
  });

  app.patch('/api/admin/facilitators/:facilitatorId', isAuthenticated, async (req: any, res) => {
    try {
      const { facilitatorId } = req.params;
      const updates = req.body;
      const updatedFacilitator = await storage.updateFacilitator(parseInt(facilitatorId), updates);
      res.json(updatedFacilitator);
    } catch (error) {
      console.error("Error updating facilitator:", error);
      res.status(500).json({ message: "Failed to update facilitator" });
    }
  });

  app.delete('/api/admin/facilitators/:facilitatorId', isAuthenticated, async (req: any, res) => {
    try {
      const { facilitatorId } = req.params;
      await storage.deleteFacilitator(parseInt(facilitatorId));
      res.json({ message: "Facilitator deleted successfully" });
    } catch (error) {
      console.error("Error deleting facilitator:", error);
      res.status(500).json({ message: "Failed to delete facilitator" });
    }
  });

  // Attendance tracking routes
  app.get('/api/admin/sessions/:sessionId/participants', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const participants = await storage.getGroupSessionParticipants(parseInt(sessionId));
      res.json(participants);
    } catch (error) {
      console.error("Error fetching session participants:", error);
      res.status(500).json({ message: "Failed to fetch session participants" });
    }
  });

  app.post('/api/admin/sessions/:sessionId/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { attendanceData } = req.body; // Array of { userId, attended }
      await storage.bulkUpdateAttendance(parseInt(sessionId), attendanceData);
      res.json({ message: "Attendance updated successfully" });
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.get('/api/admin/sessions/:sessionId/attendance-report', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const report = await storage.getSessionAttendanceReport(parseInt(sessionId));
      res.json(report);
    } catch (error) {
      console.error("Error generating attendance report:", error);
      res.status(500).json({ message: "Failed to generate attendance report" });
    }
  });

  app.get('/api/admin/facilitators/:facilitatorId/attendance-stats', isAuthenticated, async (req: any, res) => {
    try {
      const { facilitatorId } = req.params;
      const stats = await storage.getFacilitatorAttendanceStats(facilitatorId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching facilitator attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch facilitator attendance stats" });
    }
  });

  app.get('/api/admin/attendance/overview', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getOverallAttendanceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overall attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch overall attendance stats" });
    }
  });

  // Session feedback routes
  app.post('/api/sessions/:sessionId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { rating, comment, feedbackType, isAnonymous } = req.body;
      const userId = req.user.claims.sub;

      const feedback = await storage.createSessionFeedback({
        sessionId: parseInt(sessionId),
        userId,
        rating,
        comment,
        feedbackType: feedbackType || 'session',
        isAnonymous: isAnonymous || false,
      });

      res.json(feedback);
    } catch (error) {
      console.error("Error creating session feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get('/api/sessions/:sessionId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const feedback = await storage.getSessionFeedback(parseInt(sessionId));
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching session feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Session summary routes
  app.post('/api/admin/sessions/:sessionId/generate-summary', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { sessionNotes } = req.body; // Optional notes from facilitator
      
      const { aiSummaryService } = await import('./aiSummaryService');
      await aiSummaryService.processCompletedSession(parseInt(sessionId), sessionNotes);
      
      res.json({ message: "Session summary generated and distributed successfully" });
    } catch (error) {
      console.error("Error generating session summary:", error);
      res.status(500).json({ message: "Failed to generate session summary" });
    }
  });

  app.get('/api/sessions/:sessionId/summary', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const summary = await storage.getSessionSummary(parseInt(sessionId));
      res.json(summary);
    } catch (error) {
      console.error("Error fetching session summary:", error);
      res.status(500).json({ message: "Failed to fetch session summary" });
    }
  });

  app.get('/api/admin/session-summaries', isAuthenticated, async (req: any, res) => {
    try {
      const { facilitatorId } = req.query;
      const summaries = await storage.getSessionSummaries(facilitatorId as string);
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching session summaries:", error);
      res.status(500).json({ message: "Failed to fetch session summaries" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { unreadOnly } = req.query;
      const notifications = await storage.getUserNotifications(userId, unreadOnly === 'true');
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(parseInt(notificationId));
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Notification preferences routes
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.put('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.updateNotificationPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Stripe subscription routes
  if (stripe) {
    app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user?.email) {
          return res.status(400).json({ message: "User email required for subscription" });
        }

        // Check if user already has active subscription
        if (await storage.isUserPremium(userId)) {
          return res.status(400).json({ message: "User already has active subscription" });
        }

        let customerId = user.stripeCustomerId;
        
        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: userId,
              codeName: user.codeName || 'Unknown',
            },
          });
          customerId = customer.id;
        }

        // Create subscription (you'll need to set up your price ID in Stripe Dashboard)
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Replace with your actual price ID
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with Stripe info
        await storage.updateUserStripeInfo(userId, customerId, subscription.id);

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });

      } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Failed to create subscription" });
      }
    });

    app.post('/api/cancel-subscription', isPremium, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user?.stripeSubscriptionId) {
          return res.status(400).json({ message: "No active subscription found" });
        }

        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        
        // Update user subscription status
        await storage.updateUserStripeInfo(userId, user.stripeCustomerId || '', '');

        res.json({ message: "Subscription cancelled successfully" });

      } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: "Failed to cancel subscription" });
      }
    });
  }

  // Check subscription status
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isPremiumUser = await storage.isUserPremium(userId);
      const user = await storage.getUser(userId);
      
      res.json({
        isPremium: isPremiumUser,
        subscriptionStatus: user?.subscriptionStatus || 'free',
        stripeCustomerId: user?.stripeCustomerId,
        stripeSubscriptionId: user?.stripeSubscriptionId,
      });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  // ===== ENHANCED FEATURES API ENDPOINTS =====

  // Community endpoints
  app.get('/api/community/posts', async (req, res) => {
    try {
      const posts = [
        {
          id: 1,
          content: "Just completed step 3 of the RELEASE method and feeling so much lighter! The forgiveness process is truly transformative. 💙",
          milestone: "step_completed",
          isAnonymous: false,
          authorName: "Sarah M.",
          likesCount: 12,
          commentsCount: 3,
          sharesCount: 1,
          tags: ["#forgiveness", "#breakthrough", "#release"],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isLiked: false
        },
        {
          id: 2,
          content: "Today marks my one month anniversary on this healing journey. The community support here has been incredible. Thank you all for being part of my healing process.",
          milestone: "anniversary",
          isAnonymous: true,
          authorName: null,
          likesCount: 8,
          commentsCount: 5,
          sharesCount: 2,
          tags: ["#gratitude", "#community", "#healing"],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isLiked: true
        }
      ];
      res.json(posts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  app.get('/api/community/trending-tags', async (req, res) => {
    try {
      const tags = ['forgiveness', 'healing', 'breakthrough', 'gratitude', 'growth', 'peace'];
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trending tags' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/journey', isAuthenticated, async (req, res) => {
    try {
      const analytics = {
        overallProgress: 45,
        completedSteps: 3,
        totalSteps: 7,
        journalEntries: 15,
        streakDays: 7,
        longestStreak: 12,
        timeSpentMinutes: 420,
        milestones: 5
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/emotional-wellness', isAuthenticated, async (req, res) => {
    try {
      const wellness = {
        currentMood: 'peaceful',
        moodTrend: 'improving',
        emotionDistribution: {
          peaceful: 0.35,
          hopeful: 0.25,
          reflective: 0.20,
          grateful: 0.15,
          optimistic: 0.05
        },
        insights: [
          "Your emotional trend shows consistent improvement over the past week",
          "You've been particularly successful with gratitude practices",
          "Consider exploring deeper forgiveness work in relationships"
        ]
      };
      res.json(wellness);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch wellness data' });
    }
  });

  app.get('/api/analytics/community-engagement', isAuthenticated, async (req, res) => {
    try {
      const engagement = {
        storiesShared: 3,
        heartsReceived: 24,
        commentsGiven: 8,
        sessionsAttended: 2,
        supportGiven: 12,
        supportReceived: 18
      };
      res.json(engagement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch engagement data' });
    }
  });

  app.get('/api/analytics/feature-usage', isAuthenticated, async (req, res) => {
    try {
      const usage = {
        aiChatSessions: 15,
        voiceJournalEntries: 8,
        audioSessionsCompleted: 6,
        resourcesAccessed: 12,
        favoriteTool: 'journal',
        weeklyUsageHours: 5.5
      };
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch usage data' });
    }
  });

  app.get('/api/analytics/personal-insights', isAuthenticated, async (req, res) => {
    try {
      const insights = {
        strengths: [
          "Consistent daily practice with journaling",
          "Active participation in community support", 
          "Strong commitment to the RELEASE methodology",
          "Excellent emotional awareness and reflection"
        ],
        recommendations: [
          "Try incorporating voice journaling for deeper emotional expression",
          "Consider attending a group session for peer support",
          "Explore the movement exercises to complement your healing",
          "Set aside time for daily meditation practice"
        ],
        emotionalTrend: "improving"
      };
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  // Voice journaling endpoints
  app.post('/api/voice-journal/analyze', isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      const sentiment = {
        score: 0.3,
        label: 'positive',
        emotions: ['hopeful', 'reflective', 'peaceful']
      };
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze text' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
