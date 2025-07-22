import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import AudioPlayer from "@/components/AudioPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, Play, Pause, Clock, Star, CheckCircle } from "lucide-react";

export default function Audio() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [currentAudio, setCurrentAudio] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch audio sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/audio/sessions"],
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

  // Create audio session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/audio/sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audio/sessions"] });
    },
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
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start audio session.",
        variant: "destructive",
      });
    },
  });

  const audioLibrary = [
    {
      id: "empathy-meditation",
      title: "Empathy Meditation",
      instructor: "Dr. Sarah Chen",
      duration: 750, // 12:30 in seconds
      step: 2,
      stepName: "Empathize",
      description: "A guided meditation to help you understand different perspectives",
      category: "Meditation",
      image: "🧘‍♀️",
    },
    {
      id: "letting-go-breath",
      title: "Letting Go Breathwork",
      instructor: "Michael Rodriguez",
      duration: 900, // 15:00 in seconds
      step: 3,
      stepName: "Let Go",
      description: "Release emotional burdens through conscious breathing",
      category: "Breathwork",
      image: "🌬️",
    },
    {
      id: "forgiveness-visualization",
      title: "Forgiveness Visualization",
      instructor: "Dr. Amanda Wells",
      duration: 1200, // 20:00 in seconds
      step: 7,
      stepName: "Enjoy",
      description: "Visualize your journey to complete forgiveness",
      category: "Visualization",
      image: "✨",
    },
    {
      id: "morning-intentions",
      title: "Morning Intentions",
      instructor: "Lisa Thompson",
      duration: 600, // 10:00 in seconds
      step: 4,
      stepName: "Elect",
      description: "Set positive intentions for your day",
      category: "Daily Practice",
      image: "🌅",
    },
    {
      id: "gratitude-reflection",
      title: "Gratitude Reflection",
      instructor: "Dr. James Park",
      duration: 480, // 8:00 in seconds
      step: 6,
      stepName: "Sustain",
      description: "Cultivate gratitude for your healing journey",
      category: "Gratitude",
      image: "🙏",
    },
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = (audio: any) => {
    if (currentAudio?.id === audio.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audio);
      setIsPlaying(true);
      
      // Create audio session if not exists
      const existingSession = sessions?.find((s: any) => s.audioId === audio.id);
      if (!existingSession) {
        createSessionMutation.mutate({
          audioId: audio.id,
          title: audio.title,
          duration: audio.duration,
          progress: 0,
          completed: false,
        });
      }
    }
  };

  const getSessionForAudio = (audioId: string) => {
    return sessions?.find((s: any) => s.audioId === audioId);
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
        <NavigationHeader />
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
      <NavigationHeader />

      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-3 mb-4">
          <Headphones className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Audio Library</h1>
        </div>
        <p className="text-gray-600">Guided meditations and healing sessions</p>
      </section>

      {/* Currently Playing */}
      {currentAudio && (
        <section className="p-6 border-b border-gray-200">
          <AudioPlayer 
            audio={currentAudio}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onProgress={(progress) => {
              // Update progress in database
              const session = getSessionForAudio(currentAudio.id);
              if (session) {
                // Update progress API call would go here
              }
            }}
          />
        </section>
      )}

      {/* Audio Library */}
      <section className="p-6 pb-24">
        <h2 className="text-lg font-semibold mb-4">All Sessions</h2>
        
        <div className="space-y-4">
          {audioLibrary.map((audio) => {
            const session = getSessionForAudio(audio.id);
            const isCurrentlyPlaying = currentAudio?.id === audio.id && isPlaying;
            
            return (
              <Card key={audio.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-2xl">
                      {audio.image}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{audio.title}</h3>
                        {session?.completed && (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{audio.instructor}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Step {audio.step}: {audio.stepName}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {audio.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{audio.description}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{formatDuration(audio.duration)}</span>
                        {session && session.progress > 0 && (
                          <span className="text-xs text-primary">
                            {Math.round(session.progress)}% complete
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handlePlayAudio(audio)}
                      className={`w-12 h-12 rounded-full p-0 ${
                        isCurrentlyPlaying ? 'bg-secondary' : 'bg-primary'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  </div>
                  
                  {session && session.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Premium Upsell */}
        <Card className="mt-6 bg-gradient-to-r from-secondary/10 to-primary/10">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Unlock Premium Audio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get access to 50+ guided meditations and exclusive content
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = '/subscribe'}
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </section>

      <BottomNavigation />
    </div>
  );
}
