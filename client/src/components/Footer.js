import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 py-6 mt-12 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-center md:text-left">
          {/* Project Name - Left */}
          <div className="md:justify-self-start">
            <div className="font-semibold text-lg">
              © {new Date().getFullYear()} DevMetric
            </div>
          </div>
          
          {/* Social Links - Center */}
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://github.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-2 transition-colors duration-200"
            >
              <FaGithub /> GitHub
            </a>
            <a 
              href="https://linkedin.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-2 transition-colors duration-200"
            >
              <FaLinkedin /> LinkedIn
            </a>
          </div>
          
          {/* Navigation Links - Right */}
          <div className="md:justify-self-end">
            <div className="flex items-center justify-center md:justify-end gap-4 text-sm">
              <a 
                href="/about" 
                className="hover:underline hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
              >
                About
              </a>
              <a 
                href="/contact" 
                className="hover:underline hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}