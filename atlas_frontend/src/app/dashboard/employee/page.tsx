'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WithRole from '@/components/auth/with-role';
import { apiService, endpoints } from '@/lib/api';
import { FiCalendar, FiClock, FiGrid, FiSearch } from 'react-icons/fi';

interface Booking {
  id: number;
  workspace: {
    name: string;
    location: string;
  };
  start_time: string;
  end_time: string;
  status: string;
}

export default function EmployeeDashboard() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        const response = await apiService.get<Booking[]>(`${endpoints.bookings.mine}?status=confirmed`);
        setUpcomingBookings(response);
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, []);

  return (
    <WithRole roles="employee">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Employee Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-lg col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <motion.div 
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{booking.workspace.name}</h3>
                              <p className="text-sm text-gray-500">{booking.workspace.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Date(booking.start_time).toLocaleDateString()} 
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {upcomingBookings.length > 3 && (
                        <div className="text-center mt-4">
                          <Button variant="link" asChild>
                            <Link href="/dashboard/employee/bookings">View all bookings</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">You have no upcoming bookings</p>
                      <Button asChild>
                        <Link href="/dashboard/employee/book">Book a Workspace</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/employee/book">
                        <FiCalendar className="mr-2" />
                        Book Workspace
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/employee/bookings">
                        <FiClock className="mr-2" />
                        My Bookings
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/employee/workspaces">
                        <FiSearch className="mr-2" />
                        Browse Workspaces
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Available Workspaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500 mb-4">
                    Explore available workspaces for quick booking
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Button key={i} variant="outline" className="h-auto py-4" asChild>
                        <Link href="/dashboard/employee/book">
                          <div className="flex flex-col items-center">
                            <FiGrid className="h-6 w-6 mb-2" />
                            <span>Meeting Room {i}</span>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </WithRole>
  );
}
