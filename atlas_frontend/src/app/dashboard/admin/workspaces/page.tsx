'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { apiService, endpoints } from '@/lib/api';
import WithRole from '@/components/auth/with-role';
import { toast } from '@/components/ui/use-toast';
import { FiGrid, FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiMapPin, FiLayers } from 'react-icons/fi';

interface Workspace {
  id: number;
  name: string;
  location: string;
  floor?: string;
  is_active: boolean;
  is_available: boolean;
  workspace_type: WorkspaceType;
}

interface WorkspaceType {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  amenities?: Record<string, any>;
}

export default function WorkspaceManagementPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceTypes, setWorkspaceTypes] = useState<WorkspaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchWorkspaceTypes();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<Workspace[]>(endpoints.workspaces.list);
      setWorkspaces(response);
      
      // Extract unique locations for filtering
      const uniqueLocations = Array.from(new Set(response.map(w => w.location)));
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        variant: "destructive",
        title: "Error loading workspaces",
        description: "Could not load workspace data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceTypes = async () => {
    try {
      const response = await apiService.get<WorkspaceType[]>(endpoints.workspaces.types);
      setWorkspaceTypes(response);
    } catch (error) {
      console.error('Error fetching workspace types:', error);
    }
  };

  const toggleWorkspaceStatus = async (id: number, isActive: boolean) => {
    try {
      await apiService.patch(`${endpoints.workspaces.detail(id)}`, { is_active: !isActive });
      
      // Update local state
      setWorkspaces(workspaces.map(workspace => 
        workspace.id === id ? { ...workspace, is_active: !isActive } : workspace
      ));
      
      toast({
        title: "Workspace updated",
        description: `Workspace ${isActive ? 'deactivated' : 'activated'} successfully.`
      });
    } catch (error) {
      console.error('Error updating workspace status:', error);
      toast({
        variant: "destructive",
        title: "Error updating workspace",
        description: "Failed to update workspace status. Please try again."
      });
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;
    
    try {
      await apiService.delete(endpoints.workspaces.detail(selectedWorkspace.id));
      
      // Update local state
      setWorkspaces(workspaces.filter(workspace => workspace.id !== selectedWorkspace.id));
      
      toast({
        title: "Workspace deleted",
        description: "Workspace has been deleted successfully."
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        variant: "destructive",
        title: "Error deleting workspace",
        description: "Failed to delete workspace. Please try again."
      });
    }
  };

  // Filter workspaces based on search query, location, and type filters
  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = 
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || workspace.location === locationFilter;
    const matchesType = typeFilter === 'all' || workspace.workspace_type.id.toString() === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Workspace Management</h1>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <FiPlus className="mr-2" />
                Add Workspace
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add New Workspace</SheetTitle>
                <SheetDescription>
                  Create a new workspace in the system.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input id="name" placeholder="Enter workspace name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Workspace Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {workspaceTypes.map(type => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} (Capacity: {type.capacity})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor (Optional)</Label>
                  <Input id="floor" placeholder="Enter floor information" />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Workspace</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search workspaces..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {workspaceTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredWorkspaces.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Name</th>
                      <th className="py-3 text-left">Type</th>
                      <th className="py-3 text-left">Location</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Availability</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkspaces.map((workspace) => (
                      <tr key={workspace.id} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              <FiGrid />
                            </div>
                            <span className="font-medium">{workspace.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <FiLayers className="mr-2 text-gray-500" />
                            {workspace.workspace_type.name}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <FiMapPin className="mr-2 text-gray-500" />
                            {workspace.location}
                            {workspace.floor && <span className="text-gray-500 ml-1">({workspace.floor})</span>}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${workspace.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {workspace.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${workspace.is_available ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {workspace.is_available ? 'Available' : 'Occupied'}
                          </span>
                        </td>
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
                                Edit Workspace
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleWorkspaceStatus(workspace.id, workspace.is_active)}>
                                {workspace.is_active ? 'Deactivate' : 'Activate'} Workspace
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedWorkspace(workspace);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <FiTrash2 className="mr-2" />
                                Delete Workspace
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
                <p className="text-gray-500 mb-4">No workspaces found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('all');
                  setTypeFilter('all');
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Workspace Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workspaceTypes.map(type => (
                  <div key={type.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-gray-500">Capacity: {type.capacity}</p>
                      {type.description && <p className="text-sm">{type.description}</p>}
                    </div>
                    <Button variant="outline" size="sm">
                      <FiEdit className="mr-2" />
                      Edit
                    </Button>
                  </div>
                ))}
                <Button className="w-full">
                  <FiPlus className="mr-2" />
                  Add Workspace Type
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Workspace Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-700">Total Workspaces</h3>
                  <p className="text-3xl font-bold">{workspaces.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-medium text-green-700">Active Workspaces</h3>
                  <p className="text-3xl font-bold">{workspaces.filter(w => w.is_active).length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-700">Available Now</h3>
                  <p className="text-3xl font-bold">{workspaces.filter(w => w.is_active && w.is_available).length}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="text-lg font-medium text-amber-700">Workspace Types</h3>
                  <p className="text-3xl font-bold">{workspaceTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workspace</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the workspace "{selectedWorkspace?.name}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteWorkspace}>
                Delete Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WithRole>
  );
}
