# RADICAL Journey Implementation Guide

## Overview
This guide explains how to add a third journey tier called "RADICAL" for spiritually/metaphysically inclined users. This journey will be positioned as a premium offering alongside the current Guided Journey (RELEASE method).

## Implementation Strategy

### 1. Database Schema Updates

**Add to `shared/schema.ts`:**
```typescript
// Add journey type enum
export const journeyTypeEnum = pgEnum('journey_type', ['free', 'guided', 'radical']);

// Update users table
export const users = pgTable("users", {
  // ... existing fields
  journeyType: journeyTypeEnum('journey_type').default('free'),
  radicalProgress: jsonb('radical_progress'),
});

// New RADICAL steps table
export const radicalSteps = pgTable("radical_steps", {
  id: serial("id").primaryKey(),
  letter: varchar("letter", { length: 1 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  spiritualContent: text("spiritual_content"),
  metaphysicalConcepts: text("metaphysical_concepts"),
  meditationPrompts: text("meditation_prompts"),
  energyWork: text("energy_work"),
  order: integer("order").notNull(),
});

// RADICAL journey progress
export const radicalProgress = pgTable("radical_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  currentStep: integer("current_step").default(1),
  completedSteps: jsonb("completed_steps").default([]),
  overallProgress: integer("overall_progress").default(0),
  spiritualInsights: jsonb("spiritual_insights"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2. RADICAL Method Framework

**R** - **Recognize** your soul's calling and spiritual wounds
**A** - **Awaken** to higher consciousness and divine truth  
**D** - **Detach** from ego patterns and material illusions
**I** - **Integrate** shadow work and light embodiment
**C** - **Connect** with universal love and cosmic wisdom
**A** - **Activate** your authentic spiritual power
**L** - **Live** from your highest divine self

### 3. Frontend Components

**Create new journey option in `home.tsx`:**
```tsx
{/* RADICAL Journey Card */}
<Card className="border-2 border-purple-500 bg-purple-50 hover:bg-purple-100/50 transition-colors cursor-pointer hover:scale-105 transform duration-200"
  onClick={() => window.location.href = '/radical-subscribe'}
>
  <CardContent className="p-4 h-full flex flex-col">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-purple-800 text-base">RADICAL Spiritual Journey</h4>
      </div>
    </div>
    <div className="flex-1">
      <p className="text-sm text-purple-700 mb-2">Advanced metaphysical healing with cosmic consciousness</p>
      <div className="text-xs text-purple-600 space-y-1">
        <p>• Soul-level trauma healing</p>
        <p>• Consciousness expansion work</p>
        <p>• Energy healing & chakra alignment</p>
        <p>• Mystical support community</p>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-purple-200">
      <p className="text-sm font-medium text-purple-800">→ Activate higher self</p>
    </div>
  </CardContent>
</Card>
```

### 4. Backend API Routes

**Add to `server/routes.ts`:**
```typescript
// RADICAL journey routes
app.get('/api/radical/steps', async (req, res) => {
  try {
    const steps = await storage.getRadicalSteps();
    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch RADICAL steps' });
  }
});

app.get('/api/radical/progress', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const progress = await storage.getRadicalProgress(userId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

app.post('/api/radical/step/:stepId/complete', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const stepId = parseInt(req.params.stepId);
    const { spiritualInsight, energyWork } = req.body;
    
    const progress = await storage.completeRadicalStep(userId, stepId, {
      spiritualInsight,
      energyWork,
      timestamp: new Date().toISOString()
    });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete step' });
  }
});
```

### 5. Storage Layer Updates

**Add to `server/storage.ts`:**
```typescript
export interface IStorage {
  // ... existing methods
  
  // RADICAL journey methods
  getRadicalSteps(): Promise<RadicalStep[]>;
  getRadicalProgress(userId: string): Promise<RadicalProgress | undefined>;
  createRadicalProgress(userId: string): Promise<RadicalProgress>;
  completeRadicalStep(userId: string, stepId: number, insight: any): Promise<RadicalProgress>;
  updateRadicalProgress(userId: string, updates: any): Promise<RadicalProgress>;
}

export class DatabaseStorage implements IStorage {
  // ... existing methods

  async getRadicalSteps(): Promise<RadicalStep[]> {
    return await db.select().from(radicalSteps).orderBy(radicalSteps.order);
  }

  async getRadicalProgress(userId: string): Promise<RadicalProgress | undefined> {
    const [progress] = await db.select().from(radicalProgress).where(eq(radicalProgress.userId, userId));
    return progress;
  }

  async createRadicalProgress(userId: string): Promise<RadicalProgress> {
    const [progress] = await db.insert(radicalProgress)
      .values({ userId, currentStep: 1, completedSteps: [], overallProgress: 0 })
      .returning();
    return progress;
  }

  async completeRadicalStep(userId: string, stepId: number, insight: any): Promise<RadicalProgress> {
    // Implementation for completing RADICAL steps with spiritual insights
    // Similar to existing complete step logic but with RADICAL-specific fields
  }
}
```

### 6. Subscription Pricing

**RADICAL Journey Pricing Strategy:**
- Same price point as Guided Journey ($29.99/month)
- Position as alternative spiritual path, not upgrade
- Include similar premium features:
  - AI Spiritual Guide (instead of AI Companion)
  - Metaphysical Group Sessions
  - Energy Healing Resources
  - Cosmic Consciousness Community

**Update Stripe configuration:**
```typescript
// Add RADICAL price ID to environment variables
STRIPE_RADICAL_PRICE_ID=price_xxx

// Update subscription creation logic
app.post('/api/create-radical-subscription', isAuthenticated, async (req, res) => {
  // Similar to guided journey subscription but with RADICAL price ID
});
```

### 7. UI/UX Considerations

**Journey Selection Page:**
- Three equal columns on desktop
- Stacked cards on mobile
- Clear differentiation between psychological (RELEASE) and spiritual (RADICAL)
- Visual indicators: RELEASE uses blues/greens, RADICAL uses purples/golds

**Content Differentiation:**
- RELEASE: Evidence-based, therapeutic language
- RADICAL: Mystical, consciousness-focused language
- Free: Self-help, resource-focused language

### 8. Content Development

**RADICAL Step Content Examples:**

**R - Recognize Soul Calling:**
- Meditation: "Connect with your soul's deepest knowing"
- Journaling: "What spiritual wounds are calling for healing?"
- Energy Work: "Scan your chakras for blocked energy patterns"

**A - Awaken Higher Consciousness:**
- Meditation: "Expand beyond the veil of ordinary reality"
- Journaling: "What illusions are you ready to release?"
- Energy Work: "Activate your crown chakra connection"

### 9. AI Integration

**RADICAL AI Guide Features:**
- Spiritual guidance instead of therapeutic advice
- References to universal laws, energy, consciousness
- Meditation and breathwork recommendations
- Metaphysical concept explanations
- Astrology/numerology integration possibilities

### 10. Community Features

**RADICAL Community Additions:**
- Spiritual milestone sharing
- Energy healing circle discussions
- Consciousness expansion stories
- Mystical experience sharing
- Full moon/new moon group intentions

## Implementation Timeline

### Phase 1 (Week 1): Foundation
- Database schema updates
- Basic RADICAL step content creation
- Storage layer implementation

### Phase 2 (Week 2): Frontend
- RADICAL journey selection UI
- Step progression components
- Spiritual-themed design elements

### Phase 3 (Week 3): Backend
- API endpoints for RADICAL journey
- Subscription integration
- Progress tracking system

### Phase 4 (Week 4): Enhanced Features
- RADICAL AI guide customization
- Spiritual community features
- Energy work tracking tools

### Phase 5 (Week 5): Testing & Launch
- User testing with spiritual community
- Content refinement
- Soft launch to existing users

## Marketing Positioning

**Target Audience:**
- Existing users interested in deeper spiritual work
- New Age/metaphysical community members
- Yoga practitioners and meditation enthusiasts
- Energy healers and spiritual coaches
- Conscious living advocates

**Key Messaging:**
- "Transcend healing into transformation"
- "Awaken your cosmic consciousness"
- "Heal at the soul level"
- "Activate your divine potential"

## Technical Considerations

**Database Migration:**
```sql
-- Add journey type to existing users
ALTER TABLE users ADD COLUMN journey_type journey_type_enum DEFAULT 'free';

-- Create RADICAL-specific tables
-- (Generated automatically by Drizzle when schema is updated)
```

**Environment Variables:**
```
STRIPE_RADICAL_PRICE_ID=price_xxx
RADICAL_AI_PROMPT_PREFIX="You are a spiritual guide focused on consciousness expansion..."
```

This implementation allows you to add the RADICAL journey as a parallel premium offering that appeals to spiritually-minded users while maintaining the existing RELEASE method for those preferring a more psychological approach.