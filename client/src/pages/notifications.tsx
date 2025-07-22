import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellOff, 
  Check, 
  Clock, 
  Settings, 
  Mail, 
  MessageSquare,
  Calendar,
  TrendingUp,
  FileText,
  Star
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  sessionReminders: boolean;
  progressUpdates: boolean;
  sessionSummaries: boolean;
  facilitatorMessages: boolean;
}

export default function NotificationsCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Get notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: showUnreadOnly 
      ? ['/api/notifications?unreadOnly=true'] 
      : ['/api/notifications'],
  });

  // Get notification preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/notification-preferences'],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const response = await apiRequest('PUT', '/api/notification-preferences', newPreferences);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_reminder': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'progress_milestone': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'session_summary': return <FileText className="h-5 w-5 text-purple-600" />;
      case 'feedback_request': return <Star className="h-5 w-5 text-amber-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'session_reminder': return 'Session Reminder';
      case 'progress_milestone': return 'Progress Update';
      case 'session_summary': return 'Session Summary';
      case 'feedback_request': return 'Feedback Request';
      default: return 'Notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated on your forgiveness journey
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="unread-only"
                  checked={showUnreadOnly}
                  onCheckedChange={setShowUnreadOnly}
                />
                <Label htmlFor="unread-only">Show unread only</Label>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification: Notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all cursor-pointer ${
                      notification.isRead 
                        ? 'bg-gray-50 dark:bg-gray-800/50' 
                        : 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500'
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {showUnreadOnly 
                        ? 'You\'re all caught up! Check back later for updates on your journey.'
                        : 'You\'ll receive notifications about session reminders, progress updates, and more.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {preferencesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <>
                    {/* Delivery Methods */}
                    <div>
                      <h4 className="font-medium mb-4">Delivery Methods</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-600" />
                            <div>
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive updates via email</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.emailEnabled ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('emailEnabled', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-4 w-4 text-gray-600" />
                            <div>
                              <Label>SMS Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive urgent updates via SMS</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.smsEnabled ?? false}
                            onCheckedChange={(value) => handlePreferenceChange('smsEnabled', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-4 w-4 text-gray-600" />
                            <div>
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">Receive notifications in the app</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.pushEnabled ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('pushEnabled', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Notification Types */}
                    <div>
                      <h4 className="font-medium mb-4">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <div>
                              <Label>Session Reminders</Label>
                              <p className="text-sm text-muted-foreground">Upcoming group session notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.sessionReminders ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('sessionReminders', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <div>
                              <Label>Progress Updates</Label>
                              <p className="text-sm text-muted-foreground">Journey milestones and achievements</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.progressUpdates ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('progressUpdates', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <div>
                              <Label>Session Summaries</Label>
                              <p className="text-sm text-muted-foreground">AI-generated session insights and action items</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.sessionSummaries ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('sessionSummaries', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-4 w-4 text-amber-600" />
                            <div>
                              <Label>Facilitator Messages</Label>
                              <p className="text-sm text-muted-foreground">Direct communication from facilitators</p>
                            </div>
                          </div>
                          <Switch
                            checked={preferences?.facilitatorMessages ?? true}
                            onCheckedChange={(value) => handlePreferenceChange('facilitatorMessages', value)}
                            disabled={updatePreferencesMutation.isPending}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}