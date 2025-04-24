'use client';

import { useState, useEffect } from 'react';
import { WithRole } from '@/components/auth/with-role';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OccupancyChart } from '@/components/analytics/occupancy-chart';
import { PeakHoursChart } from '@/components/analytics/peak-hours-chart';
import { TrendsChart } from '@/components/analytics/trends-chart';
import { apiService } from '@/lib/api';
import { endpoints } from '@/lib/api';
import { motion } from 'framer-motion';

interface WorkspacePopularity {
  workspace_id: number;
  workspace_name: string;
  total_bookings: number;
  booking_percentage: number;
}

interface DashboardMetrics {
  total_bookings: number;
  active_bookings: number;
  workspace_utilization: number;
  revenue_this_month: number;
}

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [popularWorkspaces, setPopularWorkspaces] = useState<WorkspacePopularity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [metricsData, popularityData] = await Promise.all([
          apiService.get(endpoints.analytics.dashboard),
          apiService.get(endpoints.analytics.popularity)
        ]);

        setMetrics(metricsData);
        setPopularWorkspaces(popularityData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.total_bookings}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Active Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.active_bookings}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Workspace Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.workspace_utilization}%
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${metrics?.revenue_this_month.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Occupancy Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <OccupancyChart />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <PeakHoursChart />
                </CardContent>
              </Card>
            </div>

            {/* Popular Workspaces */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Workspaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularWorkspaces.map((workspace) => (
                    <div
                      key={workspace.workspace_id}
                      className="p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <h3 className="font-medium">{workspace.workspace_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Total Bookings: {workspace.total_bookings}
                      </p>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${workspace.booking_percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {workspace.booking_percentage}% of total bookings
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </WithRole>
  );
}