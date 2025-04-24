'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WithRole from '@/components/auth/with-role';
import OccupancyChart from '@/components/analytics/occupancy-chart';
import PeakHoursChart from '@/components/analytics/peak-hours-chart';
import TrendsChart from '@/components/analytics/trends-chart';
import { apiService, endpoints } from '@/lib/api';
import { FiTrendingUp, FiUsers, FiGrid, FiBarChart2 } from 'react-icons/fi';

interface AnalyticsData {
  total_bookings: number;
  bookings_today: number;
  avg_occupancy_today: number;
  total_users: number;
  total_workspaces: number;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiService.get(endpoints.analytics.dashboard);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const statCards = [
    {
      title: 'Total Bookings',
      value: analyticsData?.total_bookings || 0,
      icon: <FiTrendingUp className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Active Users',
      value: analyticsData?.total_users || 0,
      icon: <FiUsers className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Total Workspaces',
      value: analyticsData?.total_workspaces || 0,
      icon: <FiGrid className="h-6 w-6 text-purple-500" />,
    },
    {
      title: 'Avg Occupancy',
      value: `${Math.round(analyticsData?.avg_occupancy_today || 0)}%`,
      icon: <FiBarChart2 className="h-6 w-6 text-orange-500" />,
    },
  ];

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                          </div>
                          {stat.icon}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 gap-4 bg-muted p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <PeakHoursChart />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="occupancy" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Workspace Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <OccupancyChart />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <TrendsChart />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </WithRole>
  );
}