'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FiCheck, FiX } from 'react-icons/fi';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small teams just getting started",
      price: isAnnual ? 29 : 39,
      features: [
        "Up to 10 users",
        "5 workspace types",
        "Basic analytics",
        "Email support",
        "Standard booking interface"
      ],
      notIncluded: [
        "Advanced role management",
        "API access",
        "Custom branding",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      highlighted: false
    },
    {
      name: "Professional",
      description: "Ideal for growing teams with more complex needs",
      price: isAnnual ? 79 : 99,
      features: [
        "Up to 50 users",
        "Unlimited workspace types",
        "Advanced analytics",
        "Role-based access control",
        "Priority email support",
        "API access",
        "Custom branding options"
      ],
      notIncluded: [
        "Enterprise integrations",
        "Dedicated account manager"
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      highlighted: true
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: isAnnual ? 199 : 249,
      features: [
        "Unlimited users",
        "Unlimited workspace types",
        "Advanced analytics & reporting",
        "Custom roles & permissions",
        "24/7 premium support",
        "Full API access",
        "White labeling",
        "Custom integrations",
        "Dedicated account manager"
      ],
      notIncluded: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      highlighted: false
    }
  ];
  
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your team's needs. All plans come with a 14-day free trial.
            </p>
          </motion.div>
          
          <div className="flex items-center justify-center mt-8">
            <span className={`mr-4 ${!isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={`ml-4 ${isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              Annual <span className="text-green-500 text-sm">(Save 20%)</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-xl ${plan.highlighted ? 'border-2 border-primary shadow-lg relative' : 'border border-gray-200'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600"> /month</span>
                  {isAnnual && <span className="block text-sm text-gray-500">billed annually</span>}
                </div>
                
                <Button variant={plan.buttonVariant} className="w-full mb-8" asChild>
                  <Link href="/register">{plan.buttonText}</Link>
                </Button>
                
                <div className="space-y-4">
                  <h4 className="font-medium">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <span className="mr-2 text-green-500"><FiCheck /></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.notIncluded.length > 0 && (
                    <>
                      <h4 className="font-medium mt-4">Not included:</h4>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((feature, i) => (
                          <li key={i} className="flex items-center text-gray-500">
                            <span className="mr-2 text-gray-400"><FiX /></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center bg-gray-50 p-8 rounded-xl max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
          <p className="text-gray-600 mb-6">
            We offer tailored packages for organizations with specific requirements.
            Contact our sales team to discuss your needs.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
