import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  TreePine, 
  Heart, 
  Waves, 
  Sun, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause,
  RotateCcw,
  Target
} from "lucide-react";

interface MovementExercisesProps {
  stepNumber?: number;
  className?: string;
}

export default function MovementExercises({ stepNumber, className = "" }: MovementExercisesProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch movement exercises
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["/api/movement/exercises"],
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

  // Create movement exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: { exerciseType: string; duration: number; completed: boolean }) => {
      await apiRequest("POST", "/api/movement/exercises", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movement/exercises"] });
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
        description: "Failed to save exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update exercise completion
  const updateExerciseMutation = useMutation({
    mutationFn: async (data: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/movement/exercises/${data.id}`, { completed: data.completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movement/exercises"] });
      toast({
        title: "Exercise completed!",
        description: "Great job on completing your movement exercise.",
      });
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
    },
  });

  const movementExerciseTypes = [
    {
      id: "gentle-yoga",
      name: "Gentle Yoga",
      icon: <Heart className="w-6 h-6" />,
      duration: 900, // 15 minutes
      description: "Slow, mindful movements to release tension",
      instructions: [
        "Find a quiet space with room to move",
        "Focus on deep breathing throughout",
        "Move slowly and listen to your body",
        "Hold each pose for 30-60 seconds"
      ],
      color: "primary"
    },
    {
      id: "mindful-walking",
      name: "Mindful Walking",
      icon: <TreePine className="w-6 h-6" />,
      duration: 1200, // 20 minutes
      description: "Peaceful walk focusing on acceptance",
      instructions: [
        "Choose a safe walking path",
        "Walk at a comfortable pace",
        "Focus on your breath and surroundings",
        "Practice acceptance with each step"
      ],
      color: "accent"
    },
    {
      id: "breathing-exercise",
      name: "Breathwork",
      icon: <Waves className="w-6 h-6" />,
      duration: 600, // 10 minutes
      description: "Deep breathing for emotional release",
      instructions: [
        "Sit comfortably with your back straight",
        "Breathe in for 4 counts, hold for 4",
        "Breathe out for 6 counts",
        "Focus on releasing tension with each exhale"
      ],
      color: "secondary"
    },
    {
      id: "morning-stretch",
      name: "Morning Stretch",
      icon: <Sun className="w-6 h-6" />,
      duration: 480, // 8 minutes
      description: "Gentle stretches to start your day",
      instructions: [
        "Start with gentle neck rolls",
        "Stretch your arms and shoulders",
        "Include gentle spinal twists",
        "End with a few deep breaths"
      ],
      color: "primary"
    }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startExercise = (exerciseType: string, duration: number) => {
    setActiveExercise(exerciseType);
    setTimeRemaining(duration);
    setIsRunning(true);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          completeExercise(exerciseType, duration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseExercise = () => {
    setIsRunning(false);
  };

  const resumeExercise = () => {
    setIsRunning(true);
  };

  const resetExercise = () => {
    setActiveExercise(null);
    setTimeRemaining(0);
    setIsRunning(false);
  };

  const completeExercise = (exerciseType: string, duration: number) => {
    createExerciseMutation.mutate({
      exerciseType,
      duration,
      completed: true,
    });
    
    setActiveExercise(null);
    setTimeRemaining(0);
    setIsRunning(false);
  };

  const getExerciseForType = (type: string) => {
    return exercises?.find((ex: any) => ex.exerciseType === type);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "from-primary/10 to-primary/5 border-primary/20 text-primary";
      case "secondary":
        return "from-secondary/10 to-secondary/5 border-secondary/20 text-secondary";
      case "accent":
        return "from-accent/10 to-accent/5 border-accent/20 text-accent";
      default:
        return "from-primary/10 to-primary/5 border-primary/20 text-primary";
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Movement Exercises</h3>
        </div>
        {stepNumber && (
          <Badge variant="outline" className="text-xs">
            Step {stepNumber}: Accept
          </Badge>
        )}
      </div>

      {/* Active Exercise Timer */}
      {activeExercise && (
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                {movementExerciseTypes.find(ex => ex.id === activeExercise)?.icon}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">
                {movementExerciseTypes.find(ex => ex.id === activeExercise)?.name}
              </h4>
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((movementExerciseTypes.find(ex => ex.id === activeExercise)?.duration || 1) - timeRemaining) / (movementExerciseTypes.find(ex => ex.id === activeExercise)?.duration || 1) * 100} 
                className="w-full h-2"
              />
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button
                size="sm"
                onClick={isRunning ? pauseExercise : resumeExercise}
                className="bg-primary hover:bg-primary/90"
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetExercise}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {movementExerciseTypes.map((exercise) => {
          const userExercise = getExerciseForType(exercise.id);
          const isCompleted = userExercise?.completed || false;
          const isActive = activeExercise === exercise.id;
          
          return (
            <Card 
              key={exercise.id} 
              className={`${isCompleted ? 'bg-green-50 border-green-200' : `bg-gradient-to-br ${getColorClasses(exercise.color)}`} ${isActive ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-100' : `bg-gradient-to-br from-${exercise.color}/20 to-${exercise.color}/10`}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className={exercise.color === 'primary' ? 'text-primary' : exercise.color === 'secondary' ? 'text-secondary' : 'text-accent'}>
                        {exercise.icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{exercise.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{exercise.description}</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{formatTime(exercise.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-gray-700">Instructions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {exercise.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-gray-400">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => startExercise(exercise.id, exercise.duration)}
                  disabled={isActive || isRunning}
                  className={`w-full text-xs ${
                    isCompleted 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : exercise.color === 'primary' 
                        ? 'bg-primary hover:bg-primary/90'
                        : exercise.color === 'secondary'
                          ? 'bg-secondary hover:bg-secondary/90'
                          : 'bg-accent hover:bg-accent/90'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </>
                  ) : isActive ? (
                    "In Progress"
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}