import React, { useState } from "react";
import AnimatedLoader from "../components/AnimatedLoader";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function LeetCodeAnalyzer() {
  const [stats, setStats] = useState({ total: "", easy: "", medium: "", hard: "", categories: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setStats({ ...stats, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    const total = parseInt(stats.total, 10) || 0;
    const easy = parseInt(stats.easy, 10) || 0;
    const medium = parseInt(stats.medium, 10) || 0;
    const hard = parseInt(stats.hard, 10) || 0;
    if (easy + medium + hard !== total) {
      setError("The sum of Easy, Medium, and Hard must equal the Total questions solved.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await axios.post("/api/analyze-leetcode", {
        total: stats.total,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
        categories: stats.categories.split(",").map(s => s.trim()).filter(Boolean),
      });
      setResult({ summary: res.data.suggestion });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setAnalyzing(false);
  };

  const renderMarkdown = (markdown) => {
    // Fix spacing in headings and ensure bullet formatting
    const fixedMarkdown = (markdown || "")
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Fix consecutive capitals
      .split('\n')
      .map(line => {
        // Ensure non-heading lines are bullet points
        if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && !line.includes(':')) {
          return `- ${line.trim()}`;
        }
        return line;
      })
      .join('\n');
    
    const html = DOMPurify.sanitize(marked.parse(fixedMarkdown));
    return (
      <div 
        className="prose prose-blue dark:prose-invert max-w-none space-y-4
                   prose-headings:text-purple-700 dark:prose-headings:text-purple-300
                   prose-headings:font-bold prose-headings:text-lg prose-headings:mb-3 prose-headings:pb-2
                   prose-ul:space-y-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                   prose-li:leading-relaxed" 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  };

  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">LeetCode Analyzer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <label className="font-semibold text-gray-800 dark:text-blue-100">Total Questions Solved:</label>
        <input 
          name="total" 
          type="number" 
          min="0" 
          className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600" 
          value={stats.total} 
          onChange={handleChange} 
          required 
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-gray-800 dark:text-blue-100 block mb-2">Easy:</label>
            <input 
              name="easy" 
              type="number" 
              min="0" 
              className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600" 
              value={stats.easy} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="font-semibold text-gray-800 dark:text-blue-100 block mb-2">Medium:</label>
            <input 
              name="medium" 
              type="number" 
              min="0" 
              className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600" 
              value={stats.medium} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="font-semibold text-gray-800 dark:text-blue-100 block mb-2">Hard:</label>
            <input 
              name="hard" 
              type="number" 
              min="0" 
              className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600" 
              value={stats.hard} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <label className="font-semibold text-gray-800 dark:text-blue-100">Categories (comma-separated):</label>
        <input 
          name="categories" 
          type="text" 
          className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600" 
          value={stats.categories} 
          onChange={handleChange} 
          placeholder="e.g. Arrays, DP, Graphs, Strings" 
        />
        <button 
          type="submit" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Analyze
        </button>
      </form>
      
      {analyzing && (
        <AnimatedLoader 
          color="purple" 
          customMessages={[
            "Reading your stats...",
            "Analyzing patterns...",
            "Consulting AI...",
            "Generating tips..."
          ]} 
        />
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-8 p-8 rounded-xl bg-gray-50 dark:bg-[#1a1d2b] text-gray-900 dark:text-blue-100 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold mb-6 text-purple-700 dark:text-purple-300 pb-3 border-b border-purple-200 dark:border-purple-800">
            Analysis Results
          </div>
          {renderMarkdown(result.summary)}
        </div>
      )}
    </div>
  );
}