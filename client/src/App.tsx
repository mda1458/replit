import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Journal from "@/pages/journal";
import Audio from "@/pages/audio";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import Subscribe from "@/pages/subscribe";
import Ratings from "@/pages/ratings";
import FreeResources from "@/pages/free-resources";
import AiChat from "@/pages/ai-chat";
import GroupSessions from "@/pages/group-sessions";
import SocialCommunity from "@/pages/social-community";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import AICompanion from "@/pages/ai-companion";
import VoiceJournaling from "@/pages/voice-journaling";
import Dashboard from "@/pages/admin/dashboard";
import AdminGroupSessions from "@/pages/admin/group-sessions";
import AdminFacilitators from "@/pages/admin/facilitators";
import AttendanceTracking from "@/pages/admin/attendance";
import SessionSummariesAdmin from "@/pages/admin/session-summaries";
import NotificationsCenter from "@/pages/notifications";
import SessionFeedback from "@/pages/session-feedback";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={!isAuthenticated ? Landing : Home} />
      <Route path="/journal" component={Journal} />
      <Route path="/audio" component={Audio} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/ratings" component={Ratings} />
      <Route path="/free-resources" component={FreeResources} />
      <Route path="/ai-chat" component={AiChat} />
      <Route path="/ai-companion" component={AICompanion} />
      <Route path="/voice-journal" component={VoiceJournaling} />
      <Route path="/community" component={SocialCommunity} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/group-sessions" component={GroupSessions} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/group-sessions" component={AdminGroupSessions} />
      <Route path="/admin/facilitators" component={AdminFacilitators} />
      <Route path="/admin/attendance" component={AttendanceTracking} />
      <Route path="/admin/session-summaries" component={SessionSummariesAdmin} />
      <Route path="/notifications" component={NotificationsCenter} />
      <Route path="/session-feedback" component={SessionFeedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
