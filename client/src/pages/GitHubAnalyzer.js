import React, { useState } from "react";
import AnimatedLoader from "../components/AnimatedLoader";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

function parseSections(markdown) {
  const lines = (markdown || "").split(/\r?\n/);
  const sections = [];
  let current = null;
  
  lines.forEach((line) => {
    // Remove all asterisks first
    const cleanLine = line.replace(/\*/g, '').trim();
    
    // Check for main sections (like "Overall Profile Improvements:" or "Repository-Specific Suggestions:")
    const mainSectionMatch = cleanLine.match(/^([A-Z][A-Za-z\s]+):?\s*$/);
    // Check for repository names (single words followed by colon like "Cronjob:" or "ecommerce:")
    const repoMatch = cleanLine.match(/^([a-z][a-z0-9\-_]*):?\s*$/i);
    
    if (mainSectionMatch && !repoMatch) {
      // This is a main section
      if (current) sections.push(current);
      current = { 
        heading: mainSectionMatch[1].trim(), 
        content: [], 
        isMainSection: true 
      };
    } else if (repoMatch) {
      // This is a repository section
      if (current) sections.push(current);
      current = { 
        heading: repoMatch[1].trim(), 
        content: [], 
        isRepo: true 
      };
    } else if (current && cleanLine) {
      current.content.push(cleanLine);
    } else if (!current && cleanLine) {
      // Handle initial content without a header
      current = { heading: "Analysis Overview", content: [cleanLine], isMainSection: true };
    }
  });
  
  if (current) sections.push(current);
  return sections;
}

function renderSection(section, idx) {
  // If this is a main section, handle it differently
  if (section.isMainSection) {
    return (
      <div key={idx} className="mb-16 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-200 dark:border-blue-600 shadow-lg">
        <div className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-300 pb-4 border-b-2 border-blue-200 dark:border-blue-700 flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          {section.heading}
        </div>
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
          {section.content.map((line, lineIdx) => (
            <p key={lineIdx} className="text-base">
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // Process repository content to extract details like Description, README, etc.
  const details = [];
  let currentDetail = null;
  
  section.content.forEach(line => {
    // Clean the line completely of all asterisks and markdown
    let cleanLine = line.replace(/\*/g, '').trim();
    
    // Look for detail headers like "Description:" or "README:"
    const detailMatch = cleanLine.match(/^([A-Za-z\s]+):\s*(.*)$/);
    
    if (detailMatch) {
      // Save previous detail if exists
      if (currentDetail) details.push(currentDetail);
      
      currentDetail = {
        title: detailMatch[1].trim(),
        content: detailMatch[2] ? [detailMatch[2].trim()] : []
      };
    } else if (currentDetail && cleanLine) {
      // Add content to current detail
      currentDetail.content.push(cleanLine);
    } else if (!currentDetail && cleanLine) {
      // Content without a detail header
      if (!details.find(d => d.title === 'General')) {
        details.push({ title: 'General', content: [cleanLine] });
      } else {
        details.find(d => d.title === 'General').content.push(cleanLine);
      }
    }
  });
  
  // Don't forget the last detail
  if (currentDetail) details.push(currentDetail);

  return (
    <div key={idx} className="mb-20 p-8 bg-white dark:bg-[#242635] rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg">
      {/* Repository Header */}
      {section.heading && (
        <div className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-300 pb-4 border-b-2 border-blue-200 dark:border-blue-700 flex items-center gap-3">
          <span className="text-4xl">📦</span>
          {section.heading}
        </div>
      )}
      
      {/* Repository Details */}
      <div className="space-y-6">
        {details.map((detail, detailIdx) => (
          <div key={detailIdx} className="bg-gray-50 dark:bg-[#1e2139] p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4">
              {detail.title}
            </h4>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
              {detail.content.map((line, lineIdx) => (
                <p key={lineIdx} className="text-base">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GitHubAnalyzer() {
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post("/api/analyze-github", {
        githubProfile: input,
        githubStats: {},
      });
      setResult({ summary: res.data.suggestion });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setAnalyzing(false);
  };

  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">GitHub Analyzer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <label className="font-semibold text-gray-800 dark:text-blue-100">GitHub Username or Profile Link:</label>
        <input
          className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. torvalds or https://github.com/torvalds"
          required
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Analyze
        </button>
      </form>
      
      {analyzing && (
        <AnimatedLoader 
          color="blue" 
          customMessages={[
            "Fetching GitHub data...",
            "Analyzing repositories...",
            "Consulting AI...",
            "Generating suggestions..."
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
          <div className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-300 pb-4 border-b-2 border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            Analysis Results
          </div>
          <div className="mt-10 space-y-16">
            {parseSections(result.summary).map(renderSection)}
          </div>
        </div>
      )}
    </div>
  );
}