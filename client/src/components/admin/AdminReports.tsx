import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { AdminReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Filter
} from "lucide-react";

interface ReportConfig {
  dateRange: {
    from: Date;
    to: Date;
  };
  metrics: string[];
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
}

export default function AdminReports() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    format: 'pdf',
    metrics: [],
  });

  const { data: reports, isLoading } = useQuery<AdminReport[]>({
    queryKey: ["/api/admin/reports"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      description: string; 
      reportType: string; 
      config: any; 
    }) => {
      await apiRequest("POST", "/api/admin/reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({
        title: "Report Created",
        description: "Custom report has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setReportConfig({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to create reports.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiRequest("POST", `/api/admin/reports/${reportId}/generate`, {});
      return response.blob();
    },
    onSuccess: (blob, reportId) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Report Generated",
        description: "Report has been generated and downloaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reportTypes = [
    { value: 'user_activity', label: 'User Activity Report', icon: Users },
    { value: 'revenue', label: 'Revenue Report', icon: DollarSign },
    { value: 'engagement', label: 'Engagement Report', icon: Activity },
    { value: 'ratings', label: 'Ratings & Feedback Report', icon: BarChart3 },
  ];

  const availableMetrics = [
    { value: 'user_signups', label: 'User Signups' },
    { value: 'active_users', label: 'Active Users' },
    { value: 'premium_subscriptions', label: 'Premium Subscriptions' },
    { value: 'journal_entries', label: 'Journal Entries' },
    { value: 'audio_sessions', label: 'Audio Sessions' },
    { value: 'release_exercises', label: 'Release Exercises' },
    { value: 'average_rating', label: 'Average Rating' },
    { value: 'total_revenue', label: 'Total Revenue' },
  ];

  const getReportTypeBadge = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    if (!reportType) return <Badge variant="outline">Unknown</Badge>;
    
    return (
      <Badge variant="secondary">
        <reportType.icon className="w-3 h-3 mr-1" />
        {reportType.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Custom Reports
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Custom Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Report Name</Label>
                      <Input 
                        placeholder="Enter report name"
                        value={reportConfig.name || ''}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <Select 
                        value={reportConfig.reportType || ''}
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, reportType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Describe what this report will show"
                      value={reportConfig.description || ''}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Metrics to Include</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableMetrics.map(metric => (
                        <div key={metric.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={metric.value}
                            checked={reportConfig.metrics?.includes(metric.value)}
                            onChange={(e) => {
                              const metrics = reportConfig.metrics || [];
                              if (e.target.checked) {
                                setReportConfig(prev => ({ 
                                  ...prev, 
                                  metrics: [...metrics, metric.value] 
                                }));
                              } else {
                                setReportConfig(prev => ({ 
                                  ...prev, 
                                  metrics: metrics.filter(m => m !== metric.value) 
                                }));
                              }
                            }}
                          />
                          <label htmlFor={metric.value} className="text-sm">
                            {metric.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Export Format</Label>
                    <Select 
                      value={reportConfig.format || 'pdf'}
                      onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value as 'pdf' | 'excel' | 'csv' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        if (reportConfig.name && reportConfig.reportType) {
                          createReportMutation.mutate({
                            name: reportConfig.name,
                            description: reportConfig.description || '',
                            reportType: reportConfig.reportType,
                            config: reportConfig,
                          });
                        }
                      }}
                      disabled={createReportMutation.isPending || !reportConfig.name || !reportConfig.reportType}
                    >
                      Create Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports?.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{report.name}</h3>
                    {getReportTypeBadge(report.reportType)}
                    <Badge variant={report.isActive ? "default" : "secondary"}>
                      {report.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {new Date(report.createdAt || '').toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-1" />
                      {JSON.parse(report.config || '{}').metrics?.length || 0} metrics
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReportMutation.mutate(report.id)}
                    disabled={generateReportMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  // Generate quick report
                  generateReportMutation.mutate(0); // Use 0 for quick reports
                }}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-sm">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}