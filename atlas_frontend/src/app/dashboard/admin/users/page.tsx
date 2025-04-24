'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiService, endpoints } from '@/lib/api';
import WithRole from '@/components/auth/with-role';
import { toast } from '@/components/ui/use-toast';
import { FiMoreVertical, FiSearch, FiPlus, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<User[]>(endpoints.users.list);
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error loading users",
        description: "Could not load user data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.get<Role[]>(endpoints.roles.list);
      setRoles(response);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await apiService.patch(endpoints.users.updateRole(userId), { role: newRole });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: "Could not update user role. Please try again."
      });
    }
  };

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          
          <Button>
            <FiPlus className="mr-2" />
            Add User
          </Button>
        </div>
        
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Name</th>
                      <th className="py-3 text-left">Email</th>
                      <th className="py-3 text-left">Role</th>
                      <th className="py-3 text-left">Joined Date</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              <FiUser />
                            </div>
                            <div>
                              <p className="font-medium">{user.first_name} {user.last_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">{user.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">{new Date(user.date_joined).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FiMoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FiEdit className="mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              {['admin', 'employee', 'learner', 'general'].map((role) => (
                                <DropdownMenuItem 
                                  key={role}
                                  disabled={user.role === role}
                                  onClick={() => updateUserRole(user.id, role)}
                                >
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <FiTrash2 className="mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No users found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WithRole>
  );
}

// Helper function to get badge color based on role
function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'employee':
      return 'bg-blue-100 text-blue-800';
    case 'learner':
      return 'bg-green-100 text-green-800';
    case 'general':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
