import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Heart, 
  MessageSquare, 
  Send,
  CheckCircle,
  ArrowLeft
} from "lucide-react";

interface SessionFeedback {
  id: number;
  sessionId: number;
  userId: string;
  rating: number;
  comment: string;
  feedbackType: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function SessionFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // Get session ID from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const sessionId = urlParams.get('sessionId');
  
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState('session');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  // Get session feedback (to check if already submitted)
  const { data: existingFeedback } = useQuery({
    queryKey: ['/api/sessions', sessionId, 'feedback'],
    enabled: !!sessionId,
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const response = await apiRequest('POST', `/api/sessions/${sessionId}/feedback`, feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback!",
      });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'feedback'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      rating,
      comment,
      feedbackType,
      isAnonymous,
    });
  };

  const renderStars = (interactive: boolean = true) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-colors ${
              star <= (interactive ? (hoveredStar || rating) : rating)
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          />
        ))}
        <span className="ml-3 text-sm text-muted-foreground">
          {rating > 0 && (
            <>
              {rating} out of 5 stars
              {rating === 1 && ' - Needs improvement'}
              {rating === 2 && ' - Fair'}
              {rating === 3 && ' - Good'}
              {rating === 4 && ' - Very good'}
              {rating === 5 && ' - Excellent'}
            </>
          )}
        </span>
      </div>
    );
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto p-4">
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Invalid Session
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No session ID provided. Please access feedback from a valid session.
              </p>
              <Button onClick={() => setLocation('/group-sessions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted || (existingFeedback && existingFeedback.length > 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto p-4">
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Thank You for Your Feedback!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your feedback helps us improve our sessions and support your healing journey better.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setLocation('/group-sessions')} className="w-full">
                  View More Sessions
                </Button>
                <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Session Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Help us improve by sharing your experience
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Your Experience Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                How would you rate this session overall?
              </Label>
              {renderStars()}
            </div>

            {/* Feedback Type */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                What would you like to provide feedback on?
              </Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">Overall Session</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="content">Session Content</SelectItem>
                  <SelectItem value="format">Session Format</SelectItem>
                  <SelectItem value="technical">Technical Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Written Feedback */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Share your thoughts (optional)
              </Label>
              <Textarea
                placeholder="What went well? What could be improved? How did this session help your healing journey?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your feedback helps us create more meaningful healing experiences for everyone.
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit feedback anonymously
              </Label>
            </div>

            {/* Suggestions based on feedback type */}
            {feedbackType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {feedbackType === 'session' && "Consider sharing how the session activities helped your healing process, the pacing, and overall atmosphere."}
                  {feedbackType === 'facilitator' && "Share thoughts on the facilitator's guidance, empathy, and ability to create a safe space for sharing."}
                  {feedbackType === 'content' && "Let us know about the relevance, depth, and helpfulness of the session materials and exercises."}
                  {feedbackType === 'format' && "Provide feedback on session structure, timing, group size, and interaction methods."}
                  {feedbackType === 'technical' && "Report any issues with audio, video, platform features, or connectivity problems."}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={submitFeedbackMutation.isPending || rating === 0}
                className="w-full"
                size="lg"
              >
                {submitFeedbackMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Feedback
              </Button>
            </div>

            {/* Privacy Note */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Your feedback is confidential and will only be used to improve our services.
                {!isAnonymous && " Your identity is only visible to administrators."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}