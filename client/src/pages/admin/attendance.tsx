import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";

interface SessionParticipant {
  id: number;
  sessionId: number;
  userId: string;
  codeName: string;
  registeredAt: string;
  attended: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
}

interface AttendanceReport {
  sessionId: number;
  sessionTitle: string;
  sessionDate: string;
  totalRegistered: number;
  attended: number;
  noShows: number;
  attendanceRate: number;
  participants: SessionParticipant[];
}

interface GroupSession {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  sessionType: string;
  status: string;
  facilitatorId: string;
}

export default function AttendanceTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ [userId: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get all sessions for dropdown
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/admin/group-sessions'],
  });

  // Get participants for selected session
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['/api/admin/sessions', selectedSessionId, 'participants'],
    enabled: selectedSessionId !== null,
  });

  // Get attendance report for selected session
  const { data: attendanceReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/admin/sessions', selectedSessionId, 'attendance-report'],
    enabled: selectedSessionId !== null,
  });

  // Get overall attendance stats
  const { data: overallStats } = useQuery({
    queryKey: ['/api/admin/attendance/overview'],
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async (data: { sessionId: number; attendanceData: { userId: string; attended: boolean }[] }) => {
      const response = await apiRequest('POST', `/api/admin/sessions/${data.sessionId}/attendance`, {
        attendanceData: data.attendanceData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance Updated",
        description: "Session attendance has been saved successfully.",
      });
      setShowAttendanceDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sessions', selectedSessionId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sessions', selectedSessionId, 'attendance-report'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance/overview'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize attendance data when participants load
  useEffect(() => {
    if (participants.length > 0) {
      const initialData: { [userId: string]: boolean } = {};
      participants.forEach((participant: SessionParticipant) => {
        initialData[participant.userId] = participant.attended || false;
      });
      setAttendanceData(initialData);
    }
  }, [participants]);

  const handleAttendanceChange = (userId: string, attended: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: attended
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSessionId) return;

    const attendanceUpdates = Object.entries(attendanceData).map(([userId, attended]) => ({
      userId,
      attended
    }));

    updateAttendanceMutation.mutate({
      sessionId: selectedSessionId,
      attendanceData: attendanceUpdates
    });
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = (sessions || []).filter((session: GroupSession) => {
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.sessionType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedSession = (sessions || []).find((s: GroupSession) => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Attendance Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and manage group session attendance
            </p>
          </div>
        </div>

        {/* Overall Stats Cards */}
        {overallStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-3xl font-bold">{overallStats.totalSessions}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                    <p className="text-3xl font-bold">{overallStats.totalRegistered}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Attended</p>
                    <p className="text-3xl font-bold">{overallStats.totalAttended}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                    <p className="text-3xl font-bold">{overallStats.overallAttendanceRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Sessions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessionsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session: GroupSession) => (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSessionId === session.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.scheduledDate).toLocaleDateString()} • {session.sessionType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSessionStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {session.currentParticipants} registered
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No sessions found matching your criteria.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSessionId ? (
                reportLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : attendanceReport ? (
                  <div className="space-y-6">
                    {/* Session Info */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg">{attendanceReport.sessionTitle}</h3>
                      <p className="text-muted-foreground">
                        {new Date(attendanceReport.sessionDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{attendanceReport.totalRegistered}</p>
                        <p className="text-sm text-blue-700">Registered</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{attendanceReport.attended}</p>
                        <p className="text-sm text-green-700">Attended</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{attendanceReport.noShows}</p>
                        <p className="text-sm text-red-700">No Shows</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{attendanceReport.attendanceRate}%</p>
                        <p className="text-sm text-purple-700">Rate</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowAttendanceDialog(true)}
                        className="flex-1"
                        disabled={selectedSession?.status !== 'completed'}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedSession?.status === 'completed' ? 'Manage Attendance' : 'Session Not Completed'}
                      </Button>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">Select a session to view attendance report</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Management Dialog */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Attendance - {selectedSession?.title}</DialogTitle>
              <DialogDescription>
                Mark attendance for participants in this session. Changes are saved when you click "Save Attendance".
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {participantsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant: SessionParticipant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{participant.codeName}</div>
                        <div className="text-sm text-muted-foreground">
                          Registered: {new Date(participant.registeredAt).toLocaleDateString()}
                        </div>
                        {participant.feedbackRating && (
                          <div className="text-sm text-muted-foreground">
                            Rating: {participant.feedbackRating}/5 stars
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={attendanceData[participant.userId] || false}
                          onCheckedChange={(checked) => 
                            handleAttendanceChange(participant.userId, checked as boolean)
                          }
                        />
                        <Label className="text-sm">Attended</Label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No participants registered for this session.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAttendance}
                disabled={updateAttendanceMutation.isPending || participants.length === 0}
              >
                {updateAttendanceMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : null}
                Save Attendance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}