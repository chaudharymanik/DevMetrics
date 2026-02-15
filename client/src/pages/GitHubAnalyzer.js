import React, { useState } from "react";
import AnimatedLoader from "../components/AnimatedLoader";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { API_BASE_URL } from "../App";

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
      const res = await axios.post(`${API_BASE_URL}/api/analyze-github`, {
        githubProfile: input,
        githubStats: {},
      });
      setResult({ summary: res.data.suggestion });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setAnalyzing(false);
  };

  const renderMarkdown = (markdown) => {
    const fixedMarkdown = (markdown || "")
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .split('\n')
      .map(line => {
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
                   prose-headings:text-blue-700 dark:prose-headings:text-blue-300
                   prose-headings:font-bold prose-headings:text-lg prose-headings:mb-3 prose-headings:pb-2
                   prose-ul:space-y-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                   prose-li:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
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
          <div className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 pb-3 border-b border-blue-200 dark:border-blue-800">
            Analysis Results
          </div>
          {renderMarkdown(result.summary)}
        </div>
      )}
    </div>
  );
}