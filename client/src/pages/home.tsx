import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import ProgressRing from "@/components/ProgressRing";
import ReleaseFeature from "@/components/ReleaseFeature";
import MovementExercises from "@/components/MovementExercises";
import RatingModal from "@/components/RatingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Clock, Check, Lock, Play, Dumbbell, TreePine, Star, Bot, Users, Heart, Sparkles } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStepForRating, setSelectedStepForRating] = useState<number | null>(null);

  // Journey progress query
  const { data: progress = {}, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["/api/journey/progress"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (progressError) {
      console.error("Progress query error:", progressError);
      if (isUnauthorizedError(progressError as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    }
  }, [progressError, toast]);

  // RELEASE steps query
  const { data: releaseSteps } = useQuery({
    queryKey: ["/api/release/steps"],
  });

  // Subscription status query
  const { data: subscriptionStatus = {} } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || progressLoading) {
    return (
      <div className="responsive-container">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const currentStep = (progress as any)?.currentStep || 1;
  const completedSteps = (() => {
    try {
      if (!(progress as any)?.completedSteps) return [];
      if (typeof (progress as any).completedSteps === 'string') {
        return JSON.parse((progress as any).completedSteps);
      }
      if (Array.isArray((progress as any).completedSteps)) {
        return (progress as any).completedSteps;
      }
      return [];
    } catch (error) {
      console.warn('Could not parse completed steps, using empty array');
      return [];
    }
  })();
  const overallProgress = (progress as any)?.overallProgress || 0;

  return (
    <div className="w-full responsive-container">
      <NavigationHeader />

      {/* Hero Section */}
      <section className="p-4 sm:p-6 lg:p-8 text-center lg:col-span-2">
        <div className="hero-section relative h-64 sm:h-72 lg:h-80 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <defs>
                <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0L20 40M0 20L40 20" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#hero-pattern)"/>
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center text-white px-3 w-full">
            <div className="mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              RELEASE & Find Peace
            </h1>
            
            <div className="space-y-2 mb-3">
              <p className="text-white/90 font-medium text-base sm:text-lg">Transform Your Life By Releasing:</p>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">Resentments</span>
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">Grievances</span>
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">Anger</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">Trauma</span>
                <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">Toxic Relationships</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-yellow-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-base sm:text-lg">Gain Peace of Mind</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-3 left-3 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
          </div>
          <div className="absolute bottom-3 right-3 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
          </div>
        </div>
      </section>

      {/* Journey Options */}
      <section className="px-6 lg:px-8 mb-8 lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {/* Free Journey - Left Side */}
          <Card className="border-2 border-green-500 bg-green-50 hover:bg-green-100/50 transition-colors hover:scale-105 transform duration-200"
          >
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TreePine className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-800 text-base">Free Forgiveness Journey</h4>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-700 mb-2">Self-guided journey with abundant resources from forgiveness.world</p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>• 13+ professional resources</p>
                  <p>• Downloadable guides & worksheets</p>
                  <p>• Start immediately, no subscription</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2"
                  onClick={() => window.location.href = '/free-resources'}
                >
                  Click Here to Start Free Journey
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guided Journey - Right Side */}
          <Card className="border-2 border-amber-500 bg-amber-50 hover:bg-amber-100/50 transition-colors hover:scale-105 transform duration-200"
          >
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-base">Guided Forgiveness Journey</h4>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-700 mb-2">AI-assisted RELEASE method with professional group support</p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>• 24/7 AI therapeutic guidance</p>
                  <p>• Weekly foundation circle sessions</p>
                  <p>• Professional facilitator support</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2"
                  onClick={() => window.location.href = '/subscribe'}
                >
                  Click Here to Start Guided Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Premium Features Section */}
      {(subscriptionStatus as any)?.isPremium && (
        <section className="px-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Premium Features</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/ai-companion'}
            >
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-800 text-sm">AI Companion</h4>
                <p className="text-xs text-blue-700">24/7 support</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 hover:bg-purple-100/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/group-sessions'}
            >
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-800 text-sm">Group Sessions</h4>
                <p className="text-xs text-purple-700">Weekly support</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Progress Overview */}
      <section className="px-6 lg:px-8 mb-8 lg:col-span-2">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 max-w-2xl mx-auto">
          <CardContent className="p-6 lg:p-8">
            <h3 className="text-lg font-semibold mb-4">Your Journey Progress</h3>
            
            <div className="flex items-center justify-center mb-4">
              <ProgressRing progress={overallProgress} />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Step {currentStep} of 7 • {overallProgress}% Complete</p>
              <p className="text-xs text-gray-500 mt-1">Every step forward is a victory worth celebrating!</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* RELEASE Steps */}
      <section className="px-6 lg:px-8 mb-8 lg:col-span-2">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 text-center lg:text-left">The RELEASE Method</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {(releaseSteps as any[])?.map((step: any) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isLocked = step.id > currentStep;

            return (
              <Card 
                key={step.id}
                className={`${
                  isCompleted 
                    ? 'border-accent/20 bg-accent/5' 
                    : isCurrent 
                      ? 'border-primary/20 bg-primary/5' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center space-x-4 lg:space-x-6">
                    <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-accent' 
                        : isCurrent 
                          ? 'bg-primary animate-pulse' 
                          : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-gray-500" />
                      ) : (
                        <span className="text-white font-bold text-lg lg:text-xl">{step.letter}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-base lg:text-lg">{step.title}</h4>
                      <p className="text-sm lg:text-base text-gray-600">{step.description}</p>
                      {isCurrent && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '60%' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      {isCompleted && (
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            <span className="text-lg">★</span>
                            <span className="text-lg">★</span>
                            <span className="text-lg">★</span>
                          </div>
                        </div>
                      )}
                      {isCurrent && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Continue
                        </Button>
                      )}
                      {isLocked && (
                        <div className="px-3 py-1 bg-gray-200 rounded-full">
                          <span className="text-xs text-gray-600">Locked</span>
                        </div>
                      )}
                      {(isCompleted || isCurrent) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStepForRating(step.id);
                            setIsRatingModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Rate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Movement Exercises - Step 4 (Accept) */}
      {currentStep === 4 && (
        <section className="px-6 mb-8">
          <MovementExercises stepNumber={4} />
        </section>
      )}

      {/* Today's Reflection */}
      <section className="px-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Today's Reflection</h3>
        
        <Card className="journal-card border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary">✏️</span>
              </div>
              <h4 className="font-semibold text-gray-800">Empathy Exercise</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What emotions might the other person have been feeling?
                </label>
                <Textarea 
                  placeholder="Take a moment to consider their perspective..."
                  className="h-24 resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">5 min suggested</span>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Guided Audio */}
      <section className="px-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Guided Audio</h3>
        
        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧘</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Empathy Meditation</h4>
                <p className="text-sm text-gray-600">Guided by Dr. Sarah Chen</p>
                <p className="text-xs text-gray-500">12:30 minutes</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button size="sm" className="w-12 h-12 bg-primary rounded-full p-0">
                  <Play className="w-5 h-5 text-white" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center space-x-1 h-8">
                    {[20, 30, 25, 35, 15, 28].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full audio-wave"
                        style={{ height: `${height}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">3:45 / 12:30</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '30%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* The Release Feature */}
      <ReleaseFeature />



      {/* Premium Upgrade */}
      <section className="px-6 mb-8">
        <Card className="bg-gradient-to-r from-secondary to-primary text-white">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Crown className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Guided Forgiveness Journey</h3>
              <p className="text-sm text-white/90">Complete all 7 steps + AI guidance</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-sm">Access to all 7 RELEASE steps</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-sm">AI-powered guidance & support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-sm">Full audio meditation library</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-sm">Advanced journaling features</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-white text-primary hover:bg-gray-50 font-semibold"
                onClick={() => window.location.href = '/subscribe'}
              >
                Get Guided Journey
              </Button>
              <div className="text-center">
                <p className="text-xs text-white/80">$12.99/month subscription</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <BottomNavigation />
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setSelectedStepForRating(null);
        }}
        stepNumber={selectedStepForRating || undefined}
        title={selectedStepForRating ? `Rate Step ${selectedStepForRating}` : "Rate Your Experience"}
        description={selectedStepForRating ? `How was your experience with this step?` : "Share your feedback to help us improve"}
      />
    </div>
  );
}
