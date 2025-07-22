# Forgiveness Journey App

## Overview

This is a mobile-first wellness application designed to guide users through a structured forgiveness journey using the 7-step RELEASE methodology. The app provides a comprehensive platform for emotional healing through guided exercises, journaling, audio sessions, and progress tracking.

## Recent Changes

- **Multi-Language Support & Internationalization (January 2025)**: Implemented comprehensive i18n system with support for English, Spanish, and French. Features include automatic browser language detection, localStorage persistence, real-time language switching, and translated UI components for navigation, journey steps, notifications, and feedback systems.
- **Social Community Platform (January 2025)**: Built complete social sharing and community features allowing users to share forgiveness journey stories, milestones, and breakthroughs. Features include anonymous posting with code names, likes/hearts, comments, hashtag support, mood indicators, and social media sharing integration with engagement analytics.
- **Analytics Dashboard with Journey Visualization (January 2025)**: Created comprehensive analytics dashboard providing insights into journey progress, emotional wellness trends, engagement patterns, and community activity. Features interactive charts, mood distribution analysis, feature usage tracking, AI-powered personal insights, and milestone achievement visualization.
- **Personalized AI Companion (January 2025)**: Implemented advanced AI emotional support companion using OpenAI GPT-4o with voice interaction capabilities. Features include real-time mood tracking, sentiment analysis, personalized guidance, voice input/output, emotional state analysis, breathing exercises, and contextual conversation memory.
- **Gamified Milestone Rewards System (January 2025)**: Built comprehensive gamification system with bronze/silver/gold/platinum milestones across journey, community, consistency, sharing, and growth categories. Features include XP points, level progression, achievement tracking, reward claiming, and progress visualization with personalized achievement insights.
- **Voice-Enabled Journaling with Sentiment Analysis (January 2025)**: Developed advanced voice journaling system with real-time speech-to-text, AI sentiment analysis, emotion detection, and mindfulness modules. Features include breathing exercises, meditation prompts, audio playback, sentiment trending, and emotional wellness insights.
- **AI-Powered Session Summary System (January 2025)**: Implemented comprehensive AI session summary generation using OpenAI GPT-4o that automatically creates and distributes session insights to participants, facilitators, and admin. Features include key topics extraction, action items generation, engagement level analysis, and personalized notification delivery. Database schema includes session summaries, notifications, and user preferences tables.
- **Advanced Notifications Center (January 2025)**: Built complete notification system with mobile-first design, notification preferences management, multiple delivery methods (email, SMS, push), and categorized notification types (session reminders, progress updates, session summaries, facilitator messages). Users can filter, mark as read, and customize their notification experience.
- **Session Feedback & Rating System (January 2025)**: Implemented comprehensive feedback collection system allowing users to rate sessions 1-5 stars, provide detailed comments, choose feedback categories (session, facilitator, content), and submit anonymously. Includes facilitator performance analytics and real-time feedback aggregation.
- **Admin Session Summary Management (January 2025)**: Created admin interface for generating AI summaries with optional facilitator notes, viewing all summaries with search/filtering, tracking distribution status, and analytics on engagement levels. Facilitators can add session notes to enhance AI summary generation.
- **Enhanced Database Architecture (January 2025)**: Added four new database tables (session_feedback, session_summaries, notifications, notification_preferences) with full CRUD operations, proper relations, and data integrity. Implemented comprehensive storage layer with over 20 new methods supporting all feedback, notification, and summary operations.
- **Attendance Tracking System (January 2025)**: Implemented comprehensive attendance tracking for group sessions with database integration, API endpoints, and admin interface. Features include session selection, bulk attendance marking, real-time analytics, detailed reporting, and facilitator performance metrics. Successfully tested and approved by user.
- **Home Page Layout Enhancement (January 2025)**: Updated journey options to responsive side-by-side layout with Free Journey (left) and Guided Journey (right). Added enhanced visual design with stronger borders, hover effects, bullet points highlighting features, and mobile-responsive grid. User feedback: "Absolutely fabulous!"
- **Facilitator Management System (January 2025)**: Implemented complete facilitator management with CRUD operations, database schema updates, and admin interface. Features include facilitator profiles with bio/specialties, integration with group sessions, and sample facilitator data. Successfully tested with user creating new facilitators.
- **Free Resources Integration (January 2025)**: Implemented comprehensive Free Resources dashboard showcasing all 13 professional resources from forgiveness.world domain. Added search/filtering, access tracking analytics, and mobile-optimized design. Database schema updated with resource access tracking table.
- **Terminology Update (January 2025)**: Replaced "Full Journey" with "Guided Journey" and removed all "free trial" references. Updated landing page, subscription page, home page, and profile to reflect two clear paths: "Free Forgiveness Journey" (DIY) and "Guided Forgiveness Journey" (AI-assisted with professional support).
- **UI Component Library Expansion (January 2025)**: Added Textarea, Checkbox, and RadioGroup components to support enhanced forms and user interfaces across the application.
- **Logo Integration (January 2025)**: Added the Yellow Brick Road logo throughout the application including landing page, navigation header, admin dashboard, and hero sections. Logo is properly sized and responsive across all components.
- **Enhanced Hero Section & API Endpoints (January 2025)**: Completely redesigned hero section with attention-grabbing visuals highlighting the RELEASE method for transforming lives by releasing resentments, grievances, anger, trauma, and toxic relationships to gain peace of mind. Added comprehensive API endpoints for all enhanced features including community posts, analytics data, voice journaling, and AI companion functionality. Created detailed hero editing guide for post-deployment customization.
- **Journey Panel Call-to-Action Buttons (January 2025)**: Added prominent "Click Here" buttons to both Free and Guided Journey panels on home page. Green "Click Here to Start Free Journey" button links to free resources, amber "Click Here to Start Guided Journey" button links to subscription page. Improves user conversion by eliminating confusion about next steps.
- **Deployment Optimization & Version Tracking (January 2025)**: Implemented deployment troubleshooting with version tracking (2025.01.19.v2), clean build process, and comprehensive deployment verification checklist. Fixed mobile-first responsive design issues and ensured proper hero section display across all devices.
- **Privacy Policy & AI Consent Implementation (January 2025)**: Added comprehensive privacy compliance system with General Privacy Policy checkbox (linking to https://www.termsfeed.com/live/2e6baffd-c346-4d4f-a654-e9271b052577) and detailed AI Chatbot Consent Form modal. Integrated into registration and subscription flows with proper validation, disabled button states, and two-step consent process for Guided Journey users. Includes legal disclaimers, data protection disclosures, and user rights information.
- **Deployment Strategy Development (January 2025)**: Created comprehensive deployment solutions including GitHub upload guides, GoDaddy hosting instructions, and freelancer hiring documentation. Addressed Replit deployment pipeline issues and prepared alternative hosting strategies for Railway, Vercel, and direct domain deployment to forgiveness.info.
- **Docker Containerization (January 2025)**: Built complete Docker Compose setup with frontend (React/Nginx), backend (Node.js/Express), and database (PostgreSQL) containers. Includes production-ready Nginx reverse proxy, SSL support, health checks, and comprehensive GoDaddy cPanel deployment guides. App can now be deployed as single Docker package to any hosting provider.

## User Preferences

Preferred communication style: Simple, everyday language.

## Future Enhancement: RADICAL Journey
User envisions adding a third journey tier called "RADICAL" for spiritually/metaphysically inclined users. This would be:
- A spiritual alternative to the psychological RELEASE method
- Similar price point as Guided Journey ($29.99/month)
- Target audience: New Age/metaphysical community, yoga practitioners, energy healers
- Framework: R-A-D-I-C-A-L method focused on consciousness expansion and soul-level healing
- Implementation guide created in RADICAL_JOURNEY_IMPLEMENTATION_GUIDE.md

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling (shadcn/ui)
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions
- **Security**: HTTP-only cookies, secure sessions
- **User Management**: Automatic user creation and profile management

#### Database Schema
- **Users**: Profile information, subscription status, Stripe integration
- **Journey Progress**: Step tracking, completion status, overall progress
- **Journal Entries**: User reflections tied to specific RELEASE steps
- **Audio Sessions**: Meditation and guidance session tracking
- **User Ratings**: Step and overall experience ratings
- **Release Exercises**: Interactive emotional release activities
- **Movement Exercises**: Physical wellness components
- **Group Sessions**: Session management with types, pricing, and scheduling
- **Facilitators**: Professional facilitator profiles with specialties and credentials
- **Session Participants**: User registration and attendance tracking
- **Attendance Tracking**: Comprehensive system for marking attendance, generating reports, and analyzing participation metrics
- **Session Feedback**: User ratings and comments on sessions, facilitators, and content with anonymous option
- **Session Summaries**: AI-generated summaries with key topics, action items, engagement levels, and distribution tracking
- **Notifications**: Comprehensive notification system with multiple types and delivery tracking
- **Notification Preferences**: User customizable notification settings by type and delivery method

#### Core Features
1. **RELEASE Journey**: 7-step forgiveness methodology with two paths:
   - **Free Forgiveness Journey**: DIY journey with self-help resources
   - **Guided Forgiveness Journey**: AI-assisted with professional weekly groups
2. **Journaling System**: Prompted reflections for each step with editing capability plus voice journaling with sentiment analysis
3. **Free Resources**: External resources from forgiveness.world/downloads
4. **Progress Tracking**: Visual progress indicators and comprehensive analytics dashboard
5. **Release Feature**: Interactive emotional release exercises
6. **Crisis Support**: Emergency mental health resources
7. **Multi-Language Support**: Full internationalization with English, Spanish, and French support
8. **Social Community**: Story sharing, milestone celebrations, and peer support with anonymous options
9. **AI Companion**: Personalized emotional support with voice interaction and real-time guidance
10. **Gamification**: Milestone rewards, XP points, achievements, and level progression system
11. **Voice Features**: Speech-to-text journaling, sentiment analysis, and meditation modules
12. **Analytics Dashboard**: Journey visualization, emotional wellness trends, and AI insights
13. **AI Session Summaries**: Automated generation and distribution of session insights using OpenAI GPT-4o
14. **Advanced Notifications**: Multi-channel notification system with user preferences
15. **Session Feedback System**: Comprehensive rating and feedback collection with analytics

## Data Flow

### User Authentication Flow
1. User accesses app → Replit Auth check
2. Authenticated users access main app features
3. Unauthenticated users see landing page with login options
4. Session management through PostgreSQL store

### Journey Progress Flow
1. User completes activities → Progress updates in database
2. Progress triggers UI updates across components
3. Step completion unlocks next phases
4. Overall progress calculated from individual step completion

### Content Delivery
1. Static content served through Vite in development
2. API routes handle dynamic data (journal entries, progress, etc.)
3. Real-time updates through React Query invalidation
4. Offline-first approach with optimistic updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for serverless data storage
- **Authentication**: Replit Auth for user management
- **UI Framework**: Radix UI for accessible components
- **Payment Processing**: Stripe integration (prepared for subscriptions)
- **Development**: Replit-specific tooling and plugins

### Third-Party Services
- **Crisis Support**: Links to external mental health resources
- **Audio Content**: Prepared for external audio hosting
- **Analytics**: Prepared for user behavior tracking

## Deployment Strategy

### Development Environment
- **Platform**: Replit development environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon development database
- **Environment Variables**: Replit secrets management

### Production Deployment
- **Build Process**: Vite builds client, esbuild bundles server
- **Server**: Express.js serving both API and static files
- **Database**: Production Neon PostgreSQL instance
- **Session Storage**: PostgreSQL-backed sessions
- **Static Assets**: Served through Express in production

### Key Configuration
- **TypeScript**: Strict mode enabled across all environments
- **Path Aliases**: Configured for clean imports (@/, @shared/)
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

The architecture supports both the current free tier functionality and future premium features including AI-powered guidance, group sessions, and advanced analytics.