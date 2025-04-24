'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isAuthenticated, getUserRole, getDashboardPath } from '@/lib/auth';
import { apiService, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiCalendar, FiSettings, FiBarChart2 } from 'react-icons/fi';

interface NavbarProps {
  fixed?: boolean;
}

export default function Navbar({ fixed = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated_, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(isAuthenticated());
    setUserRole(getUserRole());

    // Handle scroll event for styling
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await apiService.post(endpoints.auth.logout, {});
      
      // Reload page to reset auth state
      window.location.href = '/';
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
      });
    }
  };

  const navbarClasses = `w-full transition-all duration-300 z-50 ${
    fixed ? 'fixed top-0 left-0' : 'relative'
  } ${
    isScrolled || !fixed
      ? 'bg-white shadow-md py-2'
      : 'bg-transparent py-4'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">ATLAS</span>
            <span className="ml-1 text-lg">Workspace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`hover:text-primary transition-colors ${pathname === '/' ? 'text-primary font-medium' : ''}`}>
              Home
            </Link>
            <Link href="/#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/#testimonials" className="hover:text-primary transition-colors">
              Testimonials
            </Link>
            
            {isAuthenticated_ ? (
              <div className="flex items-center space-x-3">
                <Button variant="outline" asChild>
                  <Link href={getDashboardPath(userRole)}>
                    Dashboard
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                      <FiUser />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardPath(userRole)}>
                        <FiHome className="mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <FiUser className="mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`${getDashboardPath(userRole)}/bookings`}>
                        <FiCalendar className="mr-2" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    {userRole === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin/analytics">
                          <FiBarChart2 className="mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <FiSettings className="mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <FiLogOut className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 py-4 border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-4">
              <Link href="/" className={`${pathname === '/' ? 'text-primary font-medium' : ''}`}>
                Home
              </Link>
              <Link href="/#features">
                Features
              </Link>
              <Link href="/#pricing">
                Pricing
              </Link>
              <Link href="/#testimonials">
                Testimonials
              </Link>
              
              {isAuthenticated_ ? (
                <>
                  <Link href={getDashboardPath(userRole)} className="font-medium">
                    Dashboard
                  </Link>
                  <Link href="/profile">
                    Profile
                  </Link>
                  <Link href={`${getDashboardPath(userRole)}/bookings`}>
                    My Bookings
                  </Link>
                  {userRole === 'admin' && (
                    <Link href="/dashboard/admin/analytics">
                      Analytics
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-red-600 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 flex flex-col space-y-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
