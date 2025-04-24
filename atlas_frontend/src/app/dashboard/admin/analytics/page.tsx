'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService, endpoints } from '@/lib/api';
import WithRole from '@/components/auth/with-role';
import OccupancyChart from '@/components/analytics/occupancy-chart';
import PeakHoursChart from '@/components/analytics/peak-hours-chart';
import TrendsChart from '@/components/analytics/trends-chart';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export interface AnalyticsDashboardData {
  total_bookings: number;
  total_active_workspaces: number;
  average_occupancy_rate: number;
  occupancy_trend: Array<{ date: string; average_occupancy: number }>;
  peak_hours: Array<{ hour: number; bookings_count: number }>;
  bookings_by_user_type: Array<{ role: string; booking_count: number }>;
  workspace_utilization: Array<{ workspace_name: string; total_hours: number; occupancy_rate: number }>;
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected time frame
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeFrame));
      
      // Format dates for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await apiService.get<AnalyticsDashboardData>(
        `${endpoints.analytics.dashboard}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
      );
      
      setData(response);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        variant: "destructive",
        title: "Error loading analytics",
        description: "Could not load analytics data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <Select
              value={timeFrame}
              onValueChange={setTimeFrame}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchAnalyticsData}>
              Refresh
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Bookings" 
                value={data.total_bookings.toString()}
                description={`Last ${timeFrame} days`}
              />
              <StatCard 
                title="Active Workspaces" 
                value={data.total_active_workspaces.toString()}
                description="Currently available"
              />
              <StatCard 
                title="Average Occupancy Rate" 
                value={`${Math.round(data.average_occupancy_rate)}%`}
                description={`Last ${timeFrame} days`}
              />
            </div>
            
            <Tabs defaultValue="occupancy" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="occupancy">Occupancy Trends</TabsTrigger>
                <TabsTrigger value="peak">Peak Hours</TabsTrigger>
                <TabsTrigger value="usage">Workspace Usage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="occupancy">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Occupancy Rate Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <OccupancyChart data={data.occupancy_trend} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="peak">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Peak Booking Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PeakHoursChart data={data.peak_hours} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="usage">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Workspace Utilization</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <TrendsChart 
                      data={data.workspace_utilization.slice(0, 10)} 
                      nameKey="workspace_name"
                      dataKey="occupancy_rate"
                      suffix="%"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Bookings by User Role</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <TrendsChart 
                    data={data.bookings_by_user_type} 
                    nameKey="role" 
                    dataKey="booking_count"
                    isVertical={false}
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Most Utilized Workspaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.workspace_utilization.slice(0, 5).map((workspace, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{workspace.workspace_name}</span>
                            <span className="text-sm font-medium">{Math.round(workspace.occupancy_rate)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${Math.min(100, workspace.occupancy_rate)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No analytics data available</p>
            <Button onClick={fetchAnalyticsData}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </WithRole>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
