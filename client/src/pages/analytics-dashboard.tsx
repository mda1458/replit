import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Calendar,
  Trophy,
  Target,
  Brain,
  Users,
  Sparkles,
  Clock,
  CheckCircle,
  MessageCircle,
  Smile,
  Meh,
  Frown,
  Star,
  Zap,
  BookOpen,
  Mic
} from "lucide-react";

interface JourneyAnalytics {
  overallProgress: number;
  completedSteps: number;
  totalSteps: number;
  journalEntries: number;
  streakDays: number;
  longestStreak: number;
  timeSpentMinutes: number;
  milestones: number;
}

interface EmotionalWellness {
  currentMood: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  emotionDistribution: {
    [emotion: string]: number;
  };
  sentimentHistory: Array<{
    date: string;
    score: number;
  }>;
  insights: string[];
}

interface CommunityEngagement {
  storiesShared: number;
  heartsReceived: number;
  commentsGiven: number;
  sessionsAttended: number;
  supportGiven: number;
  supportReceived: number;
}

interface FeatureUsage {
  aiChatSessions: number;
  voiceJournalEntries: number;
  audioSessionsCompleted: number;
  resourcesAccessed: number;
  favoriteTool: string;
  weeklyUsageHours: number;
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Get analytics data
  const { data: journeyAnalytics, isLoading: journeyLoading } = useQuery({
    queryKey: ['/api/analytics/journey', selectedPeriod],
  });

  const { data: emotionalWellness, isLoading: emotionalLoading } = useQuery({
    queryKey: ['/api/analytics/emotional-wellness', selectedPeriod],
  });

  const { data: communityEngagement, isLoading: communityLoading } = useQuery({
    queryKey: ['/api/analytics/community-engagement', selectedPeriod],
  });

  const { data: featureUsage, isLoading: featureLoading } = useQuery({
    queryKey: ['/api/analytics/feature-usage', selectedPeriod],
  });

  const { data: personalInsights } = useQuery({
    queryKey: ['/api/analytics/personal-insights'],
  });

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
      case 'joyful':
      case 'optimistic':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'sad':
      case 'melancholy':
        return <Frown className="h-5 w-5 text-blue-500" />;
      case 'neutral':
      case 'calm':
        return <Meh className="h-5 w-5 text-gray-500" />;
      default:
        return <Heart className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  if (journeyLoading || emotionalLoading || communityLoading || featureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Journey Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Insights into your forgiveness journey, emotional wellness, and personal growth
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2 bg-white dark:bg-gray-800 rounded-lg p-2">
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="emotional">Emotional</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Journey Progress</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {journeyAnalytics?.overallProgress || 0}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <Progress value={journeyAnalytics?.overallProgress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Mood</p>
                      <p className="text-2xl font-bold text-purple-600 capitalize">
                        {emotionalWellness?.currentMood || 'Peaceful'}
                      </p>
                    </div>
                    {getMoodIcon(emotionalWellness?.currentMood || 'peaceful')}
                  </div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(emotionalWellness?.moodTrend || 'stable')}
                    <span className="text-sm text-muted-foreground ml-1 capitalize">
                      {emotionalWellness?.moodTrend || 'stable'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Community Hearts</p>
                      <p className="text-2xl font-bold text-red-600">
                        {communityEngagement?.heartsReceived || 0}
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-green-600">
                        {journeyAnalytics?.streakDays || 0} days
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            {personalInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Personalized AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Your Strengths</h4>
                    <div className="space-y-2">
                      {personalInsights.strengths?.map((strength: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <p className="text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Growth Recommendations</h4>
                    <div className="space-y-2">
                      {personalInsights.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    RELEASE Steps Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Steps Completed</span>
                      <span className="font-bold">
                        {journeyAnalytics?.completedSteps || 0} / {journeyAnalytics?.totalSteps || 7}
                      </span>
                    </div>
                    <Progress 
                      value={((journeyAnalytics?.completedSteps || 0) / (journeyAnalytics?.totalSteps || 7)) * 100} 
                      className="h-3"
                    />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Time Spent</p>
                        <p className="font-medium">{Math.round((journeyAnalytics?.timeSpentMinutes || 0) / 60)} hours</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Journal Entries</p>
                        <p className="font-medium">{journeyAnalytics?.journalEntries || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Milestones Earned</span>
                      <Badge variant="secondary">{journeyAnalytics?.milestones || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Streak</span>
                      <Badge className="bg-green-100 text-green-800">
                        {journeyAnalytics?.streakDays || 0} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Longest Streak</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {journeyAnalytics?.longestStreak || 0} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emotional Tab */}
          <TabsContent value="emotional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Emotion Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(emotionalWellness?.emotionDistribution || {}).map(([emotion, percentage]) => (
                      <div key={emotion} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{emotion}</span>
                          <span>{Math.round((percentage as number) * 100)}%</span>
                        </div>
                        <Progress value={(percentage as number) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Wellness Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emotionalWellness?.insights?.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stories Shared</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {communityEngagement?.storiesShared || 0}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hearts Received</p>
                      <p className="text-2xl font-bold text-red-600">
                        {communityEngagement?.heartsReceived || 0}
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Support Given</p>
                      <p className="text-2xl font-bold text-green-600">
                        {communityEngagement?.commentsGiven || 0}
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sessions Attended</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {communityEngagement?.sessionsAttended || 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Support Received</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {communityEngagement?.supportReceived || 0}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Chat Sessions</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {featureUsage?.aiChatSessions || 0}
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Voice Journals</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {featureUsage?.voiceJournalEntries || 0}
                      </p>
                    </div>
                    <Mic className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resources Accessed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {featureUsage?.resourcesAccessed || 0}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Usage Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Favorite Tool</p>
                    <p className="font-bold text-lg capitalize">
                      {featureUsage?.favoriteTool || 'Journal'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Weekly Usage</p>
                    <p className="font-bold text-lg">
                      {featureUsage?.weeklyUsageHours || 0} hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}