import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  Video,
  User
} from "lucide-react";
import { Link } from "wouter";

interface GroupSession {
  id: number;
  title: string;
  description: string;
  scheduledTime: string;
  maxParticipants: number;
  currentParticipants: number;
  sessionType: string;
  status: string;
  meetingLink?: string;
  facilitatorId?: string;
  sessionFee?: string;
  isRecurring?: boolean;
}

export default function GroupSessions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isAuthenticated,
  });

  // Redirect to subscription if not premium
  useEffect(() => {
    if (!isLoading && isAuthenticated && subscriptionStatus && !subscriptionStatus.isPremium) {
      toast({
        title: "Premium Feature",
        description: "Group sessions require a Guided Journey subscription.",
        variant: "destructive",
      });
    }
  }, [subscriptionStatus, isAuthenticated, isLoading, toast]);

  // Get upcoming sessions
  const { data: upcomingSessions, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/group-sessions/upcoming'],
    enabled: isAuthenticated && subscriptionStatus?.isPremium,
  });

  // Get user's sessions
  const { data: mySessions, isLoading: mySessionsLoading } = useQuery({
    queryKey: ['/api/group-sessions/my-sessions'],
    enabled: isAuthenticated && subscriptionStatus?.isPremium,
  });

  // Code name state
  const [showCodeNameInput, setShowCodeNameInput] = useState<number | null>(null);
  const [codeName, setCodeName] = useState(user?.codeName || "");

  // Join session mutation  
  const joinSessionMutation = useMutation({
    mutationFn: async ({ sessionId, codeName }: { sessionId: number; codeName: string }) => {
      const response = await apiRequest('POST', `/api/group-sessions/${sessionId}/join`, { codeName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-sessions/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/group-sessions/my-sessions'] });
      setShowCodeNameInput(null);
      setCodeName("");
      toast({
        title: "Successfully Joined",
        description: "You've been registered for the group session.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error", 
        description: "Failed to join session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle joining sessions
  const handleJoinSession = (sessionId: number, sessionFee?: string) => {
    const fee = parseFloat(sessionFee || "0");
    
    if (fee > 0) {
      // Paid session - would redirect to payment flow
      toast({
        title: "Payment Required",
        description: `This session costs $${fee}. Payment integration would be implemented here.`,
        variant: "default",
      });
      return;
    }

    // Free session - show code name input if needed
    if (!codeName.trim()) {
      setShowCodeNameInput(sessionId);
      return;
    }
    
    joinSessionMutation.mutate({ sessionId, codeName: codeName.trim() });
  };

  // Handle code name submission
  const handleCodeNameSubmit = (sessionId: number) => {
    if (!codeName.trim()) {
      toast({
        title: "Code Name Required",
        description: "Please enter a code name for privacy in group sessions.",
        variant: "destructive",
      });
      return;
    }
    joinSessionMutation.mutate({ sessionId, codeName: codeName.trim() });
  };

  // Redirect to subscription page if not premium
  if (!isLoading && isAuthenticated && subscriptionStatus && !subscriptionStatus.isPremium) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Group Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Join weekly professional-led forgiveness support groups with others on similar healing journeys.
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Premium Feature</Badge>
                <p className="text-sm">This feature is available with the Guided Journey subscription.</p>
              </div>
              <Link href="/subscribe">
                <Button className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Upgrade to Guided Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isSessionFull = (session: GroupSession) => {
    return session.currentParticipants >= session.maxParticipants;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Group Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join professional-led forgiveness support groups
          </p>
        </div>

        {/* Two-Tier System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Alert className="bg-green-50 border-green-200">
            <Heart className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Free Foundation Circles</strong><br/>
              Weekly 1.5-hour support groups included with your Guided Journey subscription.
            </AlertDescription>
          </Alert>
          <Alert className="bg-blue-50 border-blue-200">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Paid Specialty Sessions</strong><br/>
              Advanced workshops (Healing Meditation, Trauma-Informed, Advanced RELEASE) for deeper healing.
            </AlertDescription>
          </Alert>
        </div>

        {/* Privacy Info */}
        <Alert className="mb-6">
          <User className="h-4 w-4" />
          <AlertDescription>
            All group sessions use Code Names for privacy and confidentiality. 
            Sessions are limited to 8 participants for optimal support and interaction.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : upcomingSessions?.length > 0 ? (
              upcomingSessions.map((session: GroupSession) => (
                <Card key={session.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          {session.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge 
                          variant={session.sessionType === 'forgiveness_foundation' ? 'default' : 'secondary'}
                        >
                          {session.sessionType === 'forgiveness_foundation' 
                            ? 'Foundation Circle' 
                            : session.sessionType === 'healing_meditation' 
                            ? 'Healing Meditation'
                            : session.sessionType === 'advanced_release'
                            ? 'Advanced RELEASE'
                            : session.sessionType === 'trauma_informed'
                            ? 'Trauma-Informed'
                            : 'Specialty Group'
                          }
                        </Badge>
                        {session.sessionFee && parseFloat(session.sessionFee) > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            ${session.sessionFee}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Free for Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{formatDate(session.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{formatTime(session.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          {session.currentParticipants}/{session.maxParticipants} participants
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSessionFull(session) ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Full
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleJoinSession(session.id, session.sessionFee)}
                        disabled={isSessionFull(session) || joinSessionMutation.isPending}
                        size="sm"
                      >
                        {joinSessionMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : isSessionFull(session) ? (
                          'Session Full'
                        ) : session.sessionFee && parseFloat(session.sessionFee) > 0 ? (
                          `Pay $${session.sessionFee} & Join`
                        ) : (
                          'Join Session'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground">
                    New group sessions are scheduled weekly. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-sessions" className="space-y-4">
            {mySessionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : mySessions?.length > 0 ? (
              mySessions.map((session: GroupSession) => (
                <Card key={session.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          {session.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {session.status}
                        </Badge>
                        {session.meetingLink && session.status === 'scheduled' && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{formatDate(session.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{formatTime(session.scheduledTime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't joined any group sessions yet.
                  </p>
                  <Button onClick={() => document.querySelector('[value="upcoming"]')?.click()}>
                    Browse Upcoming Sessions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Code Name Dialog */}
        <Dialog open={showCodeNameInput !== null} onOpenChange={() => setShowCodeNameInput(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Your Code Name</DialogTitle>
              <DialogDescription>
                For privacy and confidentiality, group sessions use code names. 
                Please choose a name you'd like to be known by in the session.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter your code name..."
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && showCodeNameInput) {
                    handleCodeNameSubmit(showCodeNameInput);
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCodeNameInput(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => showCodeNameInput && handleCodeNameSubmit(showCodeNameInput)}
                disabled={!codeName.trim() || joinSessionMutation.isPending}
              >
                {joinSessionMutation.isPending ? "Joining..." : "Join Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}