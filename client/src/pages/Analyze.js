import React from "react";
import AnalyzerForm from "../components/AnalyzerForm";
import { FaChartBar } from "react-icons/fa";

export default function Analyze() {
  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FaChartBar className="text-3xl text-blue-600 dark:text-blue-400" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analyze Your GitHub Portfolio</h2>
      </div>
      <p className="mb-8 text-gray-700 dark:text-gray-200">
        Enter your GitHub username or a summary of your portfolio to get actionable AI-powered suggestions for improvement.
      </p>
      <div className="flex justify-center mb-8">
        <img
          src="https://cdn.jsdelivr.net/gh/akabab/ai-illustrations@main/code-review-light.svg"
          alt="Code Review"
          className="w-64 rounded-xl shadow-lg border-2 border-blue-100 animate-fade-in block dark:hidden"
        />
        <img
          src="https://cdn.jsdelivr.net/gh/akabab/ai-illustrations@main/code-review-dark.svg"
          alt="Code Review Dark"
          className="w-64 rounded-xl shadow-lg border-2 border-blue-900 animate-fade-in hidden dark:block"
        />
      </div>
      <AnalyzerForm />
    </div>
  );
} 