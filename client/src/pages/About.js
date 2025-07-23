import React from "react";
import { FaInfoCircle } from "react-icons/fa";

export default function About() {
  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FaInfoCircle className="text-3xl text-blue-600 dark:text-blue-400" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About DevMetric</h2>
      </div>
      <p className="mb-6 text-gray-700 dark:text-gray-200">
        DevMetric is a next-generation tool for developers to analyze, improve, and showcase their GitHub portfolios. Powered by AI, it provides actionable insights to help you stand out in the tech world.
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 space-y-2">
        <li>AI-powered suggestions for portfolio improvement</li>
        <li>Modern, beautiful, and responsive UI</li>
        <li>Built by developers, for developers</li>
      </ul>
    </div>
  );
} 