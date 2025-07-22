import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import ProgressRing from "@/components/ProgressRing";
import StarRating from "@/components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, BookOpen, Headphones, Star, Target } from "lucide-react";

export default function Progress() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch progress data
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/journey/progress"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Fetch journal entries
  const { data: journalEntries } = useQuery({
    queryKey: ["/api/journal/entries"],
    enabled: isAuthenticated,
  });

  // Fetch audio sessions
  const { data: audioSessions } = useQuery({
    queryKey: ["/api/audio/sessions"],
    enabled: isAuthenticated,
  });

  // Fetch ratings
  const { data: ratings } = useQuery({
    queryKey: ["/api/ratings"],
    enabled: isAuthenticated,
  });

  // Fetch RELEASE steps
  const { data: releaseSteps } = useQuery({
    queryKey: ["/api/release/steps"],
  });

  if (progressLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
        <NavigationHeader />
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const currentStep = progress?.currentStep || 1;
  const completedSteps = progress?.completedSteps ? JSON.parse(progress.completedSteps) : [];
  const overallProgress = progress?.overallProgress || 0;

  // Calculate statistics
  const totalJournalEntries = journalEntries?.length || 0;
  const totalAudioSessions = audioSessions?.length || 0;
  const completedAudioSessions = audioSessions?.filter((s: any) => s.completed).length || 0;
  const averageRating = ratings?.length ? 
    ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0;

  const daysInJourney = progress?.createdAt ? 
    Math.ceil((Date.now() - new Date(progress.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
      <NavigationHeader />

      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Progress</h1>
        </div>
        <p className="text-gray-600">Track your forgiveness journey</p>
      </section>

      {/* Overall Progress */}
      <section className="p-6">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Overall Progress</h2>
                <p className="text-sm text-gray-600">Step {currentStep} of 7</p>
              </div>
              <ProgressRing progress={overallProgress} size="md" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completedSteps.length}</div>
                <div className="text-xs text-gray-600">Steps Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{daysInJourney}</div>
                <div className="text-xs text-gray-600">Days in Journey</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{Math.round(overallProgress)}%</div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Activity Summary */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800">{totalJournalEntries}</div>
              <div className="text-sm text-gray-600">Journal Entries</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Headphones className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800">{completedAudioSessions}</div>
              <div className="text-sm text-gray-600">Audio Sessions</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Step Progress */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Step Progress</h2>
        
        <div className="space-y-3">
          {releaseSteps?.map((step: any) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            
            return (
              <Card key={step.id} className={`${
                isCompleted ? 'bg-accent/5 border-accent/20' : 
                isCurrent ? 'bg-primary/5 border-primary/20' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      isCompleted ? 'bg-accent' : 
                      isCurrent ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      {step.letter}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <div>
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-accent text-white">
                          Complete
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="secondary" className="bg-primary text-white">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Emotional Journey */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Emotional Journey</h2>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Average Rating</h3>
                <p className="text-sm text-gray-600">How you've been feeling</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                <StarRating rating={Math.round(averageRating)} readonly size="sm" />
              </div>
            </div>
            
            {ratings && ratings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Recent Ratings:</p>
                {ratings.slice(0, 3).map((rating: any) => (
                  <div key={rating.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                    <StarRating rating={rating.rating} readonly size="xs" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Achievements */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {completedSteps.length >= 1 && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-800">First Step</div>
                <div className="text-xs text-gray-600">Journey Begun</div>
              </CardContent>
            </Card>
          )}
          
          {totalJournalEntries >= 5 && (
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-800">Reflective</div>
                <div className="text-xs text-gray-600">5+ Journal Entries</div>
              </CardContent>
            </Card>
          )}
          
          {completedAudioSessions >= 3 && (
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="p-4 text-center">
                <Headphones className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-800">Listener</div>
                <div className="text-xs text-gray-600">3+ Audio Sessions</div>
              </CardContent>
            </Card>
          )}
          
          {daysInJourney >= 7 && (
            <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-800">Committed</div>
                <div className="text-xs text-gray-600">7+ Days Active</div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
}
