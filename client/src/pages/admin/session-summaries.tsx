import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Send, 
  Users, 
  Calendar,
  TrendingUp,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Search,
  Filter
} from "lucide-react";

interface SessionSummary {
  id: number;
  sessionId: number;
  aiSummary: string;
  keyTopics: string[];
  actionItems: string[];
  nextSteps: string;
  participantCount: number;
  engagementLevel: string;
  generatedAt: string;
  distributedAt?: string;
  isDistributed: boolean;
}

interface GroupSession {
  id: number;
  title: string;
  description: string;
  scheduledTime: string;
  status: string;
  sessionType: string;
  facilitatorName?: string;
}

export default function SessionSummariesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Get session summaries
  const { data: summaries = [], isLoading: summariesLoading } = useQuery({
    queryKey: ['/api/admin/session-summaries', selectedFacilitator],
  });

  // Get group sessions for manual summary generation
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/admin/group-sessions'],
  });

  // Get facilitators for filtering
  const { data: facilitators = [] } = useQuery({
    queryKey: ['/api/facilitators'],
  });

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: number, notes?: string }) => {
      const response = await apiRequest('POST', `/api/admin/sessions/${sessionId}/generate-summary`, {
        sessionNotes: notes ? [notes] : undefined
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Summary Generated",
        description: "AI session summary has been generated and distributed to participants.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/session-summaries'] });
      setShowGenerateDialog(false);
      setSelectedSession(null);
      setSessionNotes('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate session summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSummary = () => {
    if (!selectedSession) return;
    
    generateSummaryMutation.mutate({
      sessionId: selectedSession.id,
      notes: sessionNotes.trim() || undefined
    });
  };

  const getEngagementColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSummaries = summaries.filter((summary: SessionSummary) => {
    if (!searchQuery) return true;
    return summary.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           summary.keyTopics?.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const completedSessions = sessions.filter((session: GroupSession) => 
    session.status === 'completed' && 
    !summaries.find((s: SessionSummary) => s.sessionId === session.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Session Summaries
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate and manage AI-powered session summaries
            </p>
          </div>
          
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 lg:mt-0">
                <Brain className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate AI Session Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Session</Label>
                  <Select 
                    value={selectedSession?.id.toString() || ''} 
                    onValueChange={(value) => {
                      const session = completedSessions.find(s => s.id === parseInt(value));
                      setSelectedSession(session || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a completed session" />
                    </SelectTrigger>
                    <SelectContent>
                      {completedSessions.map((session: GroupSession) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.title} - {formatDate(session.scheduledTime)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSession && (
                  <div>
                    <Label>Additional Session Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any specific notes, key moments, or important discussions that should be included in the AI summary..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGenerateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateSummary}
                    disabled={!selectedSession || generateSummaryMutation.isPending}
                  >
                    {generateSummaryMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Generate & Distribute
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search">Search Summaries</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by content or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="facilitator">Filter by Facilitator</Label>
            <Select value={selectedFacilitator} onValueChange={setSelectedFacilitator}>
              <SelectTrigger>
                <SelectValue placeholder="All facilitators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All facilitators</SelectItem>
                {facilitators.map((facilitator: any) => (
                  <SelectItem key={facilitator.id} value={facilitator.id.toString()}>
                    {facilitator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {filteredSummaries.length} summaries found
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Summaries</p>
                  <p className="text-2xl font-bold">{summaries.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Distributed</p>
                  <p className="text-2xl font-bold">
                    {summaries.filter((s: SessionSummary) => s.isDistributed).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">
                    {summaries.length > 0 ? 
                      Math.round((summaries.filter((s: SessionSummary) => s.engagementLevel === 'high').length / summaries.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{completedSessions.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summaries List */}
        <div className="space-y-4">
          {summariesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredSummaries.length > 0 ? (
            filteredSummaries.map((summary: SessionSummary) => (
              <Card key={summary.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Session Summary #{summary.sessionId}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getEngagementColor(summary.engagementLevel)}>
                        {summary.engagementLevel} engagement
                      </Badge>
                      {summary.isDistributed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Distributed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(summary.generatedAt)}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {summary.participantCount} participants
                    </span>
                    {summary.distributedAt && (
                      <span className="flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        Sent {formatDate(summary.distributedAt)}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* AI Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Session Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {summary.aiSummary}
                      </p>
                    </div>

                    <Separator />

                    {/* Key Topics */}
                    {summary.keyTopics && summary.keyTopics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Topics Discussed</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.keyTopics.map((topic, index) => (
                            <Badge key={index} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {summary.actionItems && summary.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Action Items</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {summary.actionItems.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next Steps */}
                    {summary.nextSteps && (
                      <div>
                        <h4 className="font-medium mb-2">Next Steps</h4>
                        <p className="text-sm text-muted-foreground">
                          {summary.nextSteps}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  No Session Summaries
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Generate AI summaries for completed sessions to provide participants with insights and action items.
                </p>
                <Button onClick={() => setShowGenerateDialog(true)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate First Summary
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}