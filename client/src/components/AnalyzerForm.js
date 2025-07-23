import React, { useState } from "react";
import axios from "axios";

export default function AnalyzerForm() {
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestion("");
    try {
      const res = await axios.post("/api/analyze", { profileSummary: input });
      setSuggestion(res.data.suggestion);
    } catch (err) {
      setSuggestion("Error: " + (err.response?.data?.error || "Something went wrong"));
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#23263a] border border-gray-300 dark:border-blue-900 shadow-lg rounded-lg p-6 flex flex-col gap-4 transition-colors duration-300"
      >
        <label className="block mb-2 font-bold text-gray-800 dark:text-blue-100">
          GitHub Username or Profile Summary:
        </label>
        <input
          className="w-full border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100 p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors duration-200"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. torvalds or '5 repos, 3 without README...'"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors duration-200 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {suggestion && (
          <div className="mt-4 p-4 rounded bg-gray-100 dark:bg-[#181926] border border-gray-300 dark:border-blue-800 text-gray-800 dark:text-blue-100 transition-colors duration-200">
            <strong className="block mb-1 text-gray-900 dark:text-blue-200">Suggestion:</strong>
            <div>{suggestion}</div>
          </div>
        )}
      </form>
    </div>
  );
} 