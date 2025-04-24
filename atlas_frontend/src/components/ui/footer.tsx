import Link from 'next/link';
import { FiMapPin, FiMail, FiPhone, FiGithub, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary">ATLAS</span>
              <span className="ml-1 text-lg">Workspace</span>
            </div>
            <p className="text-gray-600 mb-4">
              Innovative workspace booking solutions for modern organizations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" size={16} />
                <span>123 Business Avenue, Suite 400</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMail className="mr-2" size={16} />
                <span>contact@atlas-workspace.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiPhone className="mr-2" size={16} />
                <span>(555) 123-4567</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:text-primary transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-600 hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-600 hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-600 hover:text-primary transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="col-span-1">
            <h3 className="font-medium text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-600 hover:text-primary transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              &copy; {currentYear} ATLAS Workspace. All rights reserved.
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FiTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FiLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FiFacebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FiGithub size={20} />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
