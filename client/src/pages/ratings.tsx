import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import RatingModal from "@/components/RatingModal";
import StarRating from "@/components/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Plus, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  Heart,
  BarChart3
} from "lucide-react";

export default function Ratings() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Fetch ratings
  const { data: ratings, isLoading } = useQuery({
    queryKey: ["/api/ratings"],
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

  // Fetch RELEASE steps
  const { data: releaseSteps } = useQuery({
    queryKey: ["/api/release/steps"],
  });

  // Calculate statistics
  const totalRatings = ratings?.length || 0;
  const averageRating = ratings?.length 
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
    : 0;
  const ratingDistribution = ratings?.reduce((acc: any, r: any) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {}) || {};

  const getStepName = (stepNumber: number) => {
    const step = releaseSteps?.find((s: any) => s.id === stepNumber);
    return step ? `${step.title}` : `Step ${stepNumber}`;
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800">Ratings & Feedback</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setIsRatingModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Rate
          </Button>
        </div>
        <p className="text-gray-600">Track your experience and share feedback</p>
      </section>

      {/* Overview Stats */}
      <section className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-800">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-yellow-700">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{totalRatings}</div>
              <div className="text-sm text-primary">Total Ratings</div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        {totalRatings > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating] || 0;
                  const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-12">
                        <span className="text-sm text-gray-600">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Ratings List */}
      <section className="px-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Ratings</h2>
          {totalRatings > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
            </Badge>
          )}
        </div>
        
        {!ratings || ratings.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No ratings yet</h3>
              <p className="text-gray-500 mb-4">
                Share your experience to help us improve your journey
              </p>
              <Button 
                onClick={() => setIsRatingModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Rating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating: any) => (
              <Card key={rating.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {rating.stepNumber && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{rating.stepNumber}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <StarRating rating={rating.rating} readonly size="sm" />
                          <span className="text-sm text-gray-600">
                            {rating.rating}/5
                          </span>
                        </div>
                        {rating.stepNumber && (
                          <p className="text-xs text-gray-500">
                            {getStepName(rating.stepNumber)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(rating.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{rating.comment}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title="Rate Your Experience"
        description="How has your forgiveness journey been going?"
      />

      <BottomNavigation />
    </div>
  );
}