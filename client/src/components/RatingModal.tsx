import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRating from "./StarRating";
import { MessageCircle, Star } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepNumber?: number;
  title?: string;
  description?: string;
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  stepNumber, 
  title = "Rate Your Experience",
  description = "How was your experience with this step?"
}: RatingModalProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const createRatingMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string; stepNumber?: number }) => {
      await apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      toast({
        title: "Thank you!",
        description: "Your rating has been saved successfully.",
      });
      onClose();
      setRating(0);
      setComment("");
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
        description: "Failed to save your rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please rate your experience",
        description: "Select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    createRatingMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
      stepNumber,
    });
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Step indicator */}
          {stepNumber && (
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold">{stepNumber}</span>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          )}

          {/* Rating stars */}
          <div className="text-center">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How would you rate this experience?
            </Label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
                className="justify-center"
              />
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor experience"}
                {rating === 2 && "Fair experience"}
                {rating === 3 && "Good experience"}
                {rating === 4 && "Very good experience"}
                {rating === 5 && "Excellent experience"}
              </p>
            )}
          </div>

          {/* Comment section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Share your thoughts (optional)</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? What could be improved? Any insights you'd like to share..."
              className="h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createRatingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createRatingMutation.isPending || rating === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {createRatingMutation.isPending ? "Saving..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}