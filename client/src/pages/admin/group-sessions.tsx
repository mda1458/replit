import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Heart,
  Video,
  CheckCircle
} from "lucide-react";

interface GroupSession {
  id: number;
  title: string;
  description: string;
  facilitatorId: string;
  scheduledTime: string;
  maxParticipants: number;
  currentParticipants: number;
  sessionType: string;
  status: string;
  meetingLink?: string;
  sessionFee?: string;
  isRecurring?: boolean;
  recurringDayOfWeek?: number;
}

interface SessionFormData {
  title: string;
  description: string;
  facilitatorId: string;
  scheduledTime: string;
  maxParticipants: number;
  sessionType: string;
  sessionFee: string;
  isRecurring: boolean;
  recurringDayOfWeek?: number;
  meetingLink: string;
  customTypeName?: string;
}

const sessionTypes = [
  { value: "forgiveness_foundation", label: "Foundation Circle", description: "Free weekly session", defaultPrice: "0.00" },
  { value: "healing_meditation", label: "Healing Meditation", description: "Paid specialty workshop", defaultPrice: "45.00" },
  { value: "advanced_release", label: "Advanced RELEASE", description: "Paid intensive workshop", defaultPrice: "65.00" },
  { value: "trauma_informed", label: "Trauma-Informed", description: "Paid specialized therapy", defaultPrice: "75.00" },
  { value: "grief_support", label: "Grief Support Circle", description: "Specialized grief counseling", defaultPrice: "55.00" },
  { value: "relationship_healing", label: "Relationship Healing", description: "Couples and family sessions", defaultPrice: "85.00" },
  { value: "workplace_forgiveness", label: "Workplace Forgiveness", description: "Professional environment focus", defaultPrice: "95.00" },
  { value: "teen_support", label: "Teen Support Circle", description: "Youth-focused sessions", defaultPrice: "35.00" },
  { value: "custom", label: "Custom Session", description: "Create your own session type", defaultPrice: "50.00" }
];

interface Facilitator {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  specialties?: string[];
  isActive: boolean;
}

export default function AdminGroupSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<GroupSession | null>(null);
  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    facilitatorId: "",
    scheduledTime: "",
    maxParticipants: 8,
    sessionType: "forgiveness_foundation",
    sessionFee: "0.00",
    isRecurring: false,
    meetingLink: "",
    customTypeName: ""
  });

  // Get all sessions and facilitators
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/admin/group-sessions'],
  });

  const { data: facilitators = [] } = useQuery({
    queryKey: ['/api/admin/facilitators'],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const response = await apiRequest('POST', '/api/admin/group-sessions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Created",
        description: "Group session has been created successfully.",
      });
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/group-sessions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SessionFormData> }) => {
      const response = await apiRequest('PATCH', `/api/admin/group-sessions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Updated",
        description: "Group session has been updated successfully.",
      });
      setEditingSession(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/group-sessions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/group-sessions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Deleted",
        description: "Group session has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/group-sessions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      facilitatorId: "",
      scheduledTime: "",
      maxParticipants: 8,
      sessionType: "forgiveness_foundation",
      sessionFee: "0.00",
      isRecurring: false,
      meetingLink: "",
      customTypeName: ""
    });
  };

  const handleEdit = (session: GroupSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      facilitatorId: session.facilitatorId,
      scheduledTime: new Date(session.scheduledTime).toISOString().slice(0, 16),
      maxParticipants: session.maxParticipants,
      sessionType: session.sessionType,
      sessionFee: session.sessionFee || "0.00",
      isRecurring: session.isRecurring || false,
      recurringDayOfWeek: session.recurringDayOfWeek,
      meetingLink: session.meetingLink || "",
      customTypeName: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data: formData });
    } else {
      createSessionMutation.mutate(formData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSessionTypeInfo = (type: string) => {
    return sessionTypes.find(st => st.value === type) || sessionTypes[0];
  };

  const getFacilitatorName = (id: string) => {
    const facilitator = facilitators.find((f: Facilitator) => f.id.toString() === id);
    return facilitator?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Group Sessions Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage free Foundation Circles and paid specialty sessions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin/facilitators', '_blank')}
            >
              <Users className="h-4 w-4 mr-2" />
              Facilitators
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin/attendance', '_blank')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Attendance
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sessions?.filter((s: GroupSession) => new Date(s.scheduledTime) > new Date()).length > 0 ? (
              sessions.filter((s: GroupSession) => new Date(s.scheduledTime) > new Date()).map((session: GroupSession) => (
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
                          {getSessionTypeInfo(session.sessionType).label}
                        </Badge>
                        {session.sessionFee && parseFloat(session.sessionFee) > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${session.sessionFee}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            <Heart className="h-3 w-3 mr-1" />
                            Free
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
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          {session.currentParticipants}/{session.maxParticipants} participants
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Facilitator: {getFacilitatorName(session.facilitatorId)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {session.meetingLink && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Meeting Link
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(session)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSessionMutation.mutate(session.id)}
                          disabled={deleteSessionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first group session to get started.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {/* Similar content but showing all sessions */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sessions?.length > 0 ? (
              sessions.map((session: GroupSession) => (
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
                          variant={session.status === 'completed' ? 'outline' : 'default'}
                        >
                          {session.status}
                        </Badge>
                        <Badge 
                          variant={session.sessionType === 'forgiveness_foundation' ? 'default' : 'secondary'}
                        >
                          {getSessionTypeInfo(session.sessionType).label}
                        </Badge>
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
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          {session.currentParticipants}/{session.maxParticipants} participants
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          ${session.sessionFee || "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Facilitator: {getFacilitatorName(session.facilitatorId)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(session)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSessionMutation.mutate(session.id)}
                          disabled={deleteSessionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
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
                    Create your first group session to get started.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Session Dialog */}
        <Dialog open={showCreateDialog || editingSession !== null} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingSession(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Session" : "Create New Session"}
              </DialogTitle>
              <DialogDescription>
                {editingSession ? "Update the session details below." : "Create a new group session. Foundation Circles are free for premium users, while specialty sessions require payment."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Forgiveness Foundation Circle"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select 
                    value={formData.sessionType} 
                    onValueChange={(value) => {
                      const sessionType = sessionTypes.find(st => st.value === value);
                      setFormData({ 
                        ...formData, 
                        sessionType: value,
                        sessionFee: sessionType?.defaultPrice || '50.00',
                        title: value === 'custom' ? '' : formData.title
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.sessionType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customTypeName">Custom Session Type Name</Label>
                  <Input
                    id="customTypeName"
                    value={formData.customTypeName}
                    onChange={(e) => setFormData({ ...formData, customTypeName: e.target.value })}
                    placeholder="e.g., Corporate Wellness, Addiction Recovery, etc."
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what participants can expect from this session..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facilitator">Facilitator</Label>
                  <Select 
                    value={formData.facilitatorId} 
                    onValueChange={(value) => setFormData({ ...formData, facilitatorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facilitator" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilitators.map((facilitator: Facilitator) => (
                        <SelectItem key={facilitator.id} value={facilitator.id.toString()}>
                          {facilitator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionFee">Session Fee ($)</Label>
                  <Input
                    id="sessionFee"
                    type="number"
                    step="0.01"
                    value={formData.sessionFee}
                    onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.forgiveness.world/..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingSession(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                >
                  {createSessionMutation.isPending || updateSessionMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : null}
                  {editingSession ? "Update Session" : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}