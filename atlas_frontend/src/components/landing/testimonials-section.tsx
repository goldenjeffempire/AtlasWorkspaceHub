'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatar: string;
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const testimonialRef = useRef<HTMLDivElement>(null);
  
  const testimonials: Testimonial[] = [
    {
      quote: "ATLAS has transformed how our team collaborates. The analytics dashboard gives us incredible insights into workspace usage, and the booking system is seamless.",
      author: "Sarah Johnson",
      role: "Head of Operations",
      company: "Innovate Tech",
      rating: 5,
      avatar: "SJ"
    },
    {
      quote: "We switched to ATLAS after trying several booking platforms. The role-based access controls and reporting features are exactly what we needed for our hybrid work model.",
      author: "Michael Chen",
      role: "Director of Facilities",
      company: "Global Systems Inc.",
      rating: 5,
      avatar: "MC"
    },
    {
      quote: "As a university, we needed a solution that could handle different types of workspaces and user roles. ATLAS delivered perfectly, and the analytics help us optimize our spaces.",
      author: "Dr. Emily Rodriguez",
      role: "Campus Planning Director",
      company: "State University",
      rating: 4,
      avatar: "ER"
    },
    {
      quote: "The customer support team at ATLAS has been exceptional. They helped us customize the platform to our specific needs and always respond quickly to questions.",
      author: "David Wilson",
      role: "IT Manager",
      company: "Creative Solutions",
      rating: 5,
      avatar: "DW"
    }
  ];
  
  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);
  
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Trusted by organizations of all sizes around the world.
            </p>
          </motion.div>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div ref={testimonialRef} className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {testimonials[currentIndex].avatar}
                  </div>
                </div>
                
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i}
                        className={`${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        size={20} 
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl italic mb-6">
                    "{testimonials[currentIndex].quote}"
                  </blockquote>
                  
                  <div>
                    <p className="font-semibold text-lg">{testimonials[currentIndex].author}</p>
                    <p className="text-gray-600">{testimonials[currentIndex].role}, {testimonials[currentIndex].company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="flex justify-center mt-8 gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevious}
              disabled={isAnimating}
              className="rounded-full"
            >
              <FiChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </Button>
            
            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating && index !== currentIndex) {
                      setIsAnimating(true);
                      setCurrentIndex(index);
                    }
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNext}
              disabled={isAnimating}
              className="rounded-full"
            >
              <FiChevronRight size={20} />
              <span className="sr-only">Next</span>
            </Button>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-8">
              Join 500+ organizations already using ATLAS Workspace
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, index) => (
                <div key={index} className="text-xl font-bold text-gray-400">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
