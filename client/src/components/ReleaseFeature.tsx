import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wind, Sparkles, ArrowRight } from "lucide-react";

export default function ReleaseFeature() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [releaseText, setReleaseText] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const createReleaseExerciseMutation = useMutation({
    mutationFn: async (data: { exerciseType: string; content: string; completed: boolean }) => {
      await apiRequest("POST", "/api/release/exercises", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/release/exercises"] });
      toast({
        title: "Released!",
        description: "Your emotional burden has been released. Take a deep breath.",
      });
      setReleaseText("");
      setIsReleasing(false);
      setShowAnimation(false);
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
        description: "Failed to save release exercise. Please try again.",
        variant: "destructive",
      });
      setIsReleasing(false);
      setShowAnimation(false);
    },
  });

  const handleRelease = () => {
    if (!releaseText.trim()) {
      toast({
        title: "Share your thoughts",
        description: "Write something you'd like to release before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsReleasing(true);
    setShowAnimation(true);

    // Simulate release animation
    setTimeout(() => {
      createReleaseExerciseMutation.mutate({
        exerciseType: "emotional_release",
        content: releaseText,
        completed: true,
      });
    }, 2000);
  };

  return (
    <section className="px-6 mb-8">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <Wind className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">The Release</h3>
              <p className="text-sm text-gray-600">Let go of what no longer serves you</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                What would you like to release today?
              </Label>
              <Textarea
                value={releaseText}
                onChange={(e) => setReleaseText(e.target.value)}
                placeholder="Write about anger, hurt, resentment, or any emotional burden you're ready to let go of..."
                className="h-32 resize-none bg-white/80 border-gray-200 focus:border-primary"
                disabled={isReleasing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-600">
                  {isReleasing ? "Releasing..." : "Transform your pain into peace"}
                </span>
              </div>
              <Button
                onClick={handleRelease}
                disabled={isReleasing || !releaseText.trim()}
                className={`bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white ${
                  isReleasing ? "animate-pulse" : ""
                }`}
              >
                {isReleasing ? (
                  <>
                    <Wind className="w-4 h-4 mr-2 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Release
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Animation overlay */}
          {showAnimation && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/20 to-transparent animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute top-2 left-2 w-12 h-12 bg-primary/30 rounded-full animate-ping delay-75" />
                <div className="absolute top-4 left-4 w-8 h-8 bg-primary/40 rounded-full animate-ping delay-150" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}