'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WithRole from '@/components/auth/with-role';
import { apiService, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { FiGrid, FiSearch, FiPlus, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkspaceType {
  id: number;
  name: string;
  description: string;
  capacity: number; //Added capacity from original
  amenities?: Record<string, any>; //Added amenities from original
}

interface Workspace {
  id: number;
  name: string;
  location: string;
  floor?: string;
  is_active: boolean;
  is_available: boolean;
  workspace_type: WorkspaceType;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceTypes, setWorkspaceTypes] = useState<WorkspaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
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

    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch workspaces',
        variant: 'destructive',
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
      toast({
        title: 'Error',
        description: 'Failed to fetch workspace types',
        variant: 'destructive',
      });
    }
  };

  const toggleWorkspaceStatus = async (workspace: Workspace) => {
    try {
      await apiService.patch(endpoints.workspaces.detail(workspace.id), {
        is_active: !workspace.is_active,
      });
      fetchWorkspaces(); //Refetch after update
      toast({
        title: 'Success',
        description: `Workspace ${workspace.is_active ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating workspace status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workspace status',
        variant: 'destructive',
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

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || workspace.workspace_type.id.toString() === selectedType;
    const matchesLocation = selectedLocation === 'all' || workspace.location === selectedLocation;
    const matchesStatus = showInactive || workspace.is_active;
    return matchesSearch && matchesType && matchesLocation && matchesStatus;
  });

  const locations = Array.from(new Set(workspaces.map(w => w.location)));

  return (
    <WithRole roles="admin">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Workspace Management</h1>
          <Button>
            <FiPlus className="mr-2" /> Add Workspace
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search workspaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<FiSearch />}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Types</SelectItem>
                      {workspaceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant={showInactive ? 'default' : 'outline'}
                  onClick={() => setShowInactive(!showInactive)}
                >
                  Show Inactive
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Workspaces</p>
                  <p className="text-2xl font-bold">{workspaces.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Workspaces</p>
                  <p className="text-2xl font-bold text-green-600">
                    {workspaces.filter(w => w.is_active).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Now</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workspaces.filter(w => w.is_active && w.is_available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <Card key={workspace.id} className={`shadow-lg ${!workspace.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{workspace.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <FiEdit className="h-4 w-4" onClick={() => {/*Add edit functionality here*/}} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleWorkspaceStatus(workspace)}
                      >
                        <FiTrash2 className="h-4 w-4" onClick={() => {/*Add delete functionality here*/}} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Type: {workspace.workspace_type.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Location: {workspace.location}
                      {workspace.floor && ` (Floor ${workspace.floor})`}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${workspace.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {workspace.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${workspace.is_available ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {workspace.is_available ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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