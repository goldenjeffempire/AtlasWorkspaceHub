
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FiArrowRight, FiGrid, FiUsers, FiClock, FiStar } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main>
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl font-bold leading-tight mb-6">
                  Welcome to ATLAS Workspace
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Smart workspace booking for modern teams. Book your perfect workspace in seconds.
                </p>
                <div className="space-x-4">
                  <Button size="lg" asChild>
                    <Link href="/dashboard/general">Get Started <FiArrowRight className="ml-2" /></Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <FiGrid className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Flexible Spaces</h3>
                  <p className="text-gray-600">Choose from various workspace types</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <FiUsers className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Team Friendly</h3>
                  <p className="text-gray-600">Perfect for collaboration</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <FiClock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Quick Booking</h3>
                  <p className="text-gray-600">Book in just a few clicks</p>
                </Card>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <FiStar className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Premium Features</h3>
                  <p className="text-gray-600">Enhanced workspace experience</p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary/5 py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-gray-600">Workspaces</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <div className="text-gray-600">Happy Users</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
