'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  FiCalendar, 
  FiUsers, 
  FiBarChart2, 
  FiLayers, 
  FiBell, 
  FiGlobe, 
  FiShield, 
  FiSmartphone 
} from 'react-icons/fi';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const features = [
    {
      icon: <FiCalendar size={24} />,
      title: "Simplified Booking",
      description: "Book any workspace with just a few clicks, from anywhere and any device."
    },
    {
      icon: <FiUsers size={24} />,
      title: "Role-Based Access",
      description: "Custom permissions and views based on user roles within your organization."
    },
    {
      icon: <FiBarChart2 size={24} />,
      title: "Insightful Analytics",
      description: "Detailed usage metrics to optimize your workspace utilization and occupancy."
    },
    {
      icon: <FiLayers size={24} />,
      title: "Flexible Workspaces",
      description: "Support for all workspace types - from meeting rooms to hot desks and quiet zones."
    },
    {
      icon: <FiBell size={24} />,
      title: "Smart Notifications",
      description: "Timely alerts for bookings, changes, and available spaces matching preferences."
    },
    {
      icon: <FiGlobe size={24} />,
      title: "Multi-Location Support",
      description: "Seamlessly manage workspaces across multiple office locations globally."
    },
    {
      icon: <FiShield size={24} />,
      title: "Enterprise Security",
      description: "Bank-level security with role-based permissions and data encryption."
    },
    {
      icon: <FiSmartphone size={24} />,
      title: "Mobile Optimized",
      description: "Full functionality on any device with our responsive web application."
    }
  ];
  
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Workplaces</h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage workspace booking efficiently and optimize office utilization.
            </p>
          </motion.div>
        </div>
        
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, index, isInView }: FeatureCardProps & { isInView: boolean }) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      }
    })
  };
  
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
