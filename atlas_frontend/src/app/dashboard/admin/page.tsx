'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WithRole from '@/components/auth/with-role';
import { apiService, endpoints } from '@/lib/api';
import { FiUsers, FiBarChart2, FiCalendar, FiGrid } from 'react-icons/fi';

interface DashboardStats {
  total_users: number;
  total_bookings: number;
  total_workspaces: number;
  occupancy_rate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch analytics data
        const response = await apiService.get<any>(endpoints.analytics.dashboard);
        
        // Set stats from response
        setStats({
          total_users: response.total_active_users || 0,
          total_bookings: response.total_bookings || 0,
          total_workspaces: response.total_active_workspaces || 0,
          occupancy_rate: response.average_occupancy_rate || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard 
                title="Total Users" 
                value={stats?.total_users || 0} 
                icon={<FiUsers className="h-8 w-8" />} 
                href="/dashboard/admin/users" 
              />
              <StatsCard 
                title="Total Bookings" 
                value={stats?.total_bookings || 0} 
                icon={<FiCalendar className="h-8 w-8" />} 
                href="/dashboard/admin/bookings" 
              />
              <StatsCard 
                title="Active Workspaces" 
                value={stats?.total_workspaces || 0} 
                icon={<FiGrid className="h-8 w-8" />} 
                href="/dashboard/admin/workspaces" 
              />
              <StatsCard 
                title="Avg. Occupancy Rate" 
                value={`${Math.round(stats?.occupancy_rate || 0)}%`} 
                icon={<FiBarChart2 className="h-8 w-8" />} 
                href="/dashboard/admin/analytics" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <Button asChild>
                      <Link href="/dashboard/admin/users">Manage Users</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/admin/workspaces">Manage Workspaces</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/admin/analytics">View Analytics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No recent activity to display.</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </WithRole>
  );
}

// Stats card component
function StatsCard({ title, value, icon, href }: { title: string; value: number | string; icon: React.ReactNode; href: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href}>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
              </div>
              <div className="bg-primary/10 rounded-full p-3 text-primary">
                {icon}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
