import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Star, 
  Trophy, 
  Gift, 
  Sparkles, 
  Heart,
  Target,
  Calendar,
  Users,
  MessageCircle,
  CheckCircle,
  Crown,
  Zap,
  Lock,
  Unlock
} from "lucide-react";

interface Milestone {
  id: number;
  title: string;
  description: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: {
    type: string;
    target: number;
    current: number;
  }[];
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: string;
  rewards: {
    type: string;
    value: string;
    description: string;
  }[];
}

interface Achievement {
  id: number;
  milestoneId: number;
  title: string;
  description: string;
  tier: string;
  pointsEarned: number;
  earnedAt: string;
  isNew: boolean;
}

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  nextLevelPoints: number;
  completedMilestones: number;
  totalMilestones: number;
  currentStreak: number;
  longestStreak: number;
}

export default function MilestoneRewards() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Get user stats and progress
  const { data: userStats } = useQuery({
    queryKey: ['/api/gamification/stats'],
  });

  // Get milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['/api/gamification/milestones', selectedCategory],
  });

  // Get recent achievements
  const { data: recentAchievements = [] } = useQuery({
    queryKey: ['/api/gamification/achievements/recent'],
  });

  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await apiRequest('POST', `/api/gamification/milestones/${milestoneId}/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reward Claimed! 🎉",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification'] });
    },
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'gold': return <Trophy className="h-4 w-4" />;
      case 'platinum': return <Crown className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'journey': return <Target className="h-5 w-5" />;
      case 'community': return <Users className="h-5 w-5" />;
      case 'streak': return <Calendar className="h-5 w-5" />;
      case 'sharing': return <MessageCircle className="h-5 w-5" />;
      case 'growth': return <Sparkles className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const formatProgress = (milestone: Milestone) => {
    if (milestone.requirements.length === 0) return 100;
    const totalProgress = milestone.requirements.reduce((sum, req) => {
      return sum + Math.min(req.current / req.target, 1);
    }, 0);
    return Math.round((totalProgress / milestone.requirements.length) * 100);
  };

  const categories = [
    { value: 'all', label: 'All Milestones', icon: Award },
    { value: 'journey', label: 'Journey Progress', icon: Target },
    { value: 'community', label: 'Community', icon: Users },
    { value: 'streak', label: 'Consistency', icon: Calendar },
    { value: 'sharing', label: 'Sharing & Support', icon: MessageCircle },
    { value: 'growth', label: 'Personal Growth', icon: Sparkles }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-purple-600">
                  {userStats?.currentLevel || 1}
                </p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress 
                value={((userStats?.totalPoints || 0) / (userStats?.nextLevelPoints || 100)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {userStats?.totalPoints || 0} / {userStats?.nextLevelPoints || 100} XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userStats?.totalPoints || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold text-green-600">
                  {userStats?.completedMilestones || 0}/{userStats?.totalMilestones || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {userStats?.currentStreak || 0} days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAchievements.map((achievement: Achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${achievement.isNew ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getTierColor(achievement.tier)}>
                      {getTierIcon(achievement.tier)}
                      <span className="ml-1">{achievement.tier}</span>
                    </Badge>
                    {achievement.isNew && <Badge variant="secondary">New!</Badge>}
                  </div>
                  <h4 className="font-semibold mb-1">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      +{achievement.pointsEarned} XP
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setSelectedCategory(category.value)}
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((milestone: Milestone) => {
          const progress = formatProgress(milestone);
          const isClaimable = milestone.isCompleted && milestone.isUnlocked;

          return (
            <Card key={milestone.id} className={`overflow-hidden ${isClaimable ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(milestone.category)}
                    <Badge className={getTierColor(milestone.tier)}>
                      {getTierIcon(milestone.tier)}
                      <span className="ml-1">{milestone.tier}</span>
                    </Badge>
                  </div>
                  {milestone.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : milestone.isUnlocked ? (
                    <Unlock className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg">{milestone.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  {milestone.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{req.type}</span>
                      <span className={req.current >= req.target ? 'text-green-600 font-medium' : ''}>
                        {req.current} / {req.target}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Points & Rewards */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">{milestone.points} XP</span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Gift className="h-4 w-4 mr-1" />
                        Rewards
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{milestone.title} - Rewards</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        {milestone.rewards.map((reward, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Gift className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium">{reward.value}</h4>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isClaimable && (
                        <Button 
                          onClick={() => claimRewardMutation.mutate(milestone.id)}
                          disabled={claimRewardMutation.isPending}
                          className="w-full"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Rewards
                        </Button>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {milestones.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              No Milestones Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start your journey to unlock amazing milestones and rewards!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}