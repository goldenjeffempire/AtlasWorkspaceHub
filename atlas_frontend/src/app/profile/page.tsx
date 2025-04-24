'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { apiService, endpoints } from '@/lib/api';
import ProfileForm from '@/components/profile/profile-form';
import { toast } from '@/components/ui/use-toast';
import { isAuthenticated } from '@/lib/auth';
import { User } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await apiService.get<User>(endpoints.auth.profile);
        setUser(response);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Could not load your profile information. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleProfileUpdate = async (updatedData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await apiService.patch<User>(endpoints.auth.profile, updatedData);
      setUser(response);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "Could not update your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : user ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-4">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
                <h3 className="font-medium text-lg">{user.first_name} {user.last_name}</h3>
                <p className="text-gray-500">{user.role}</p>
                <p className="text-sm mt-2">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs defaultValue="personal">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="notifications">Notification Preferences</TabsTrigger>
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm 
                      user={user} 
                      onSubmit={handleProfileUpdate}
                      isLoading={loading}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Notification Form */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleProfileUpdate({
                          email_notifications: user.email_notifications,
                          push_notifications: user.push_notifications,
                        });
                      }}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Email Notifications</h3>
                              <p className="text-sm text-gray-500">Receive booking confirmations and reminders via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={user.email_notifications}
                                onChange={() => setUser({...user, email_notifications: !user.email_notifications})}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Push Notifications</h3>
                              <p className="text-sm text-gray-500">Receive real-time updates on bookings and workspace changes</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={user.push_notifications}
                                onChange={() => setUser({...user, push_notifications: !user.push_notifications})}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                          
                          <Button type="submit" className="mt-4">
                            Save Preferences
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="bookings">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>
                      View your past and upcoming bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <p className="text-gray-500">Your booking history will appear here.</p>
                        <Button className="mt-4" asChild>
                          <a href={`/dashboard/${user.role.toLowerCase()}/bookings`}>View All Bookings</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Could not load profile information</p>
              <Button onClick={() => router.push('/login')}>
                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
