import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminMetricsChartProps {
  type?: 'user_growth' | 'revenue' | 'ratings' | 'activity';
  dateRange?: string;
}

export default function AdminMetricsChart({ type = 'user_growth', dateRange = '30d' }: AdminMetricsChartProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/admin/metrics/chart", type, dateRange],
  });

  if (isLoading) {
    return (
      <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'user_growth':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Total Users"
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#8b5cf6"
                name="Revenue ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'ratings':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageRating" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Average Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'activity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="journalEntries" fill="#06b6d4" name="Journal Entries" />
              <Bar dataKey="audioSessions" fill="#84cc16" name="Audio Sessions" />
              <Bar dataKey="releaseExercises" fill="#f97316" name="Release Exercises" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderChart()}
    </div>
  );
}