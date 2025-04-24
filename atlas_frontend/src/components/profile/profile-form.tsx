'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/auth';

// Define the form schema
const formSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  profile_image: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  user: User;
  onSubmit: (values: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export default function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Initialize the form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      department: user.department || '',
      profile_image: user.profile_image || '',
    },
  });

  // Handle form submission
  const handleSubmit = async (values: ProfileFormValues) => {
    await onSubmit(values);
    setIsEditing(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your first name" 
                    {...field} 
                    disabled={!isEditing || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your last name" 
                    {...field} 
                    disabled={!isEditing || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your phone number" 
                  {...field} 
                  disabled={!isEditing || isLoading}
                />
              </FormControl>
              <FormDescription>
                Used for booking confirmations and updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your department" 
                  {...field} 
                  disabled={!isEditing || isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="profile_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/your-image.jpg" 
                  {...field} 
                  disabled={!isEditing || isLoading}
                />
              </FormControl>
              <FormDescription>
                Enter a URL for your profile picture
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
