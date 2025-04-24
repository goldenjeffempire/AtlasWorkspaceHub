'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FiArrowRight, FiCalendar, FiUsers, FiBarChart2 } from 'react-icons/fi';

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Smart Workspace Booking for Modern Teams
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Streamline workplace utilization, boost productivity, and create the ideal
              hybrid work environment for your organization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="text-md">
                  <Link href="/register">
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="text-md">
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </motion.div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-${(i + 1) * 100} flex items-center justify-center text-white text-xs font-medium`}>
                    {['JD', 'MK', 'AS', 'RW'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-yellow-400">
                      {star}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Trusted by 500+ organizations worldwide</p>
              </div>
            </div>
          </motion.div>
          
          {/* App Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
              animate={{ y: isHovered ? -5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-2 text-sm text-gray-600">ATLAS Workspace Dashboard</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="col-span-1 bg-primary/10 rounded-lg p-4 flex flex-col items-center justify-center">
                    <FiCalendar className="text-primary mb-2" size={24} />
                    <span className="text-sm font-medium">12 Bookings</span>
                  </div>
                  <div className="col-span-1 bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <FiUsers className="text-blue-600 mb-2" size={24} />
                    <span className="text-sm font-medium">8 Workspaces</span>
                  </div>
                  <div className="col-span-1 bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <FiBarChart2 className="text-green-600 mb-2" size={24} />
                    <span className="text-sm font-medium">85% Rate</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Meeting Room A</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>
                    </div>
                    <div className="text-sm text-gray-600">Floor 2, East Wing</div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Focus Pod B</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Booked</span>
                    </div>
                    <div className="text-sm text-gray-600">Floor 1, Quiet Zone</div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Collaboration Space</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>
                    </div>
                    <div className="text-sm text-gray-600">Floor 3, Innovation Hub</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
