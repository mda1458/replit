import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Send, Bot, User, AlertTriangle, Heart, Clock } from "lucide-react";
import { Link } from "wouter";

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: any;
}

interface Conversation {
  id: number;
  title: string;
  stepNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AiChat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        description: "AI chat requires a Guided Journey subscription.",
        variant: "destructive",
      });
    }
  }, [subscriptionStatus, isAuthenticated, isLoading, toast]);

  // Get conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/ai/conversations'],
    enabled: isAuthenticated && subscriptionStatus?.isPremium,
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/ai/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { title: string; stepNumber?: number }) => {
      const response = await apiRequest('POST', '/api/ai/conversations', data);
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      setSelectedConversation(newConversation.id);
      toast({
        title: "New Chat Started",
        description: "Your conversation with the AI therapist has begun.",
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
        description: "Failed to start new conversation.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; stepNumber?: number }) => {
      const response = await apiRequest('POST', `/api/ai/conversations/${selectedConversation}/messages`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/ai/conversations', selectedConversation, 'messages'] 
      });
      setNewMessage("");
      
      if (data.needsCrisisSupport) {
        setShowCrisisSupport(true);
      }
      
      if (data.stepSuggestion) {
        toast({
          title: "Step Suggestion",
          description: `The AI therapist suggests working on RELEASE Step ${data.stepSuggestion}`,
        });
      }
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
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to subscription page if not premium
  if (!isLoading && isAuthenticated && subscriptionStatus && !subscriptionStatus.isPremium) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Bot className="h-6 w-6 text-blue-600" />
                AI Therapist Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Get personalized guidance through your forgiveness journey with our AI therapist.
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

  if (!isAuthenticated || isLoading || conversationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      content: newMessage.trim(),
      stepNumber: undefined, // Could be enhanced with current step tracking
    });
  };

  const startNewConversation = () => {
    createConversationMutation.mutate({
      title: "Forgiveness Chat",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Crisis Support Alert */}
      {showCrisisSupport && (
        <Alert className="m-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Crisis Support Resources</p>
              <p className="text-sm">If you're experiencing a mental health crisis, please reach out for immediate help:</p>
              <div className="text-sm space-y-1">
                <p>• National Suicide Prevention Lifeline: 988</p>
                <p>• Crisis Text Line: Text HOME to 741741</p>
                <p>• Emergency Services: 911</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCrisisSupport(false)}
                className="mt-2"
              >
                I understand
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">AI Therapist</h2>
              <Button onClick={startNewConversation} size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {conversations?.map((conversation: Conversation) => (
                <Card 
                  key={conversation.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedConversation === conversation.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {conversation.stepNumber && (
                        <Badge variant="outline" className="text-xs">
                          Step {conversation.stepNumber}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!conversations?.length && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    messages?.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>

                        {message.role === 'user' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share what's on your mind..."
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">AI Forgiveness Therapist</h3>
                <p className="text-sm mb-4 max-w-md">
                  Start a conversation to receive personalized guidance through your forgiveness journey using the RELEASE methodology.
                </p>
                <Button onClick={startNewConversation}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}