import React, { useState } from "react";
import AnimatedLoader from "../components/AnimatedLoader";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        setError(null);
        
        if (!file) {
            setError("Please upload a PDF or DOCX file.");
            return;
        }
        
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== "pdf" && ext !== "docx") {
            setError("Only PDF and DOCX files are supported.");
            return;
        }
        
        setAnalyzing(true);
        
        try {
            const formData = new FormData();
            formData.append("resume", file);
            const res = await axios.post("/api/analyze-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult({ summary: res.data.suggestion });
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong");
        }
        
        setAnalyzing(false);
    };

    const extractScore = (markdown) => {
        if (!markdown) return null;

        // Look for score patterns like "85/100", "Score: 85", "85%", etc.
        const scoreMatches = markdown.match(/(\d+)\/(\d+)|Score:\s*(\d+)|(\d+)%|(\d+)\s*out\s*of\s*(\d+)/i);
        
        if (scoreMatches) {
            if (scoreMatches[1] && scoreMatches[2]) {
                return { score: scoreMatches[1], total: scoreMatches[2] };
            } else if (scoreMatches[3]) {
                return { score: scoreMatches[3], total: 100 };
            } else if (scoreMatches[4]) {
                return { score: scoreMatches[4], total: 100 };
            } else if (scoreMatches[5] && scoreMatches[6]) {
                return { score: scoreMatches[5], total: scoreMatches[6] };
            }
        }
        
        return null;
    };

    const removeScoreFromMarkdown = (markdown) => {
        if (!markdown) return markdown;
        
        return markdown
            .replace(/(\d+)\/(\d+)/g, '')
            .replace(/Score:\s*(\d+)/gi, '')
            .replace(/(\d+)%/g, '')
            .replace(/(\d+)\s*out\s*of\s*(\d+)/gi, '')
            .replace(/\n\s*\n/g, '\n') // Remove extra empty lines
            .trim();
    };

    const renderMarkdown = (markdown) => {
        // Fix spacing in headings and ensure bullet formatting
        const fixedMarkdown = (markdown || "")
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Fix consecutive capitals
            .replace(/(ATS|Resume)(Score|Analysis|Feedback)/g, '$1 $2') // Specific combinations
            .split('\n')
            .map(line => {
                // Ensure non-heading lines are bullet points (except score lines)
                if (line.trim() &&
                    !line.startsWith('#') &&
                    !line.startsWith('-') &&
                    !line.startsWith('*') &&
                    !line.includes(':') &&
                    !line.match(/\d+\/\d+/)) { // Don't bullet-ify scores like "85/100"
                    return `- ${line.trim()}`;
                }
                return line;
            })
            .join('\n');

        const html = DOMPurify.sanitize(marked.parse(fixedMarkdown));
        
        return (
            <div
                className="prose prose-blue dark:prose-invert max-w-none space-y-4
                    prose-headings:text-green-700 dark:prose-headings:text-green-300
                    prose-headings:font-bold prose-headings:text-lg prose-headings:mb-3 prose-headings:pb-2
                    prose-ul:space-y-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    };

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return "text-green-600 dark:text-green-400";
        if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBackground = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
        if (percentage >= 60) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    };

    return (
        <div className="px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Resume Analyzer
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8" encType="multipart/form-data">
                <label className="font-semibold text-gray-800 dark:text-blue-100">
                    Upload Resume (PDF or DOCX):
                </label>
                
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleChange}
                    className="file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700 hover:file:bg-green-100
                        dark:file:bg-green-900 dark:file:text-green-200 dark:hover:file:bg-green-800
                        file:cursor-pointer cursor-pointer
                        border border-gray-300 dark:border-blue-800 rounded-lg p-2
                        bg-white dark:bg-[#181926] text-gray-900 dark:text-blue-100"
                    required
                />
                
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Analyze
                </button>
            </form>

            {analyzing && (
                <AnimatedLoader
                    color="green"
                    customMessages={[
                        "Reading your resume...",
                        "Analyzing content...",
                        "Consulting AI...",
                        "Scoring and generating feedback..."
                    ]}
                />
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-8 space-y-6">
                    {/* Score Display */}
                    {(() => {
                        const scoreData = extractScore(result.summary);
                        if (scoreData) {
                            return (
                                <div className={`p-6 rounded-xl border-2 ${getScoreBackground(scoreData.score, scoreData.total)} text-center`}>
                                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Resume Score
                                    </h3>
                                    
                                    <div className={`text-6xl font-bold ${getScoreColor(scoreData.score, scoreData.total)} mb-2`}>
                                        {scoreData.score}
                                        <span className="text-3xl">/{scoreData.total}</span>
                                    </div>
                                    
                                    <div className="text-lg text-gray-600 dark:text-gray-400">
                                        {Math.round((scoreData.score / scoreData.total) * 100)}% Match
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Analysis Results */}
                    <div className="p-8 rounded-xl bg-gray-50 dark:bg-[#1a1d2b] text-gray-900 dark:text-blue-100 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold mb-6 text-green-700 dark:text-green-300 pb-3 border-b border-green-200 dark:border-green-800">
                            Analysis Results
                        </div>
                        {renderMarkdown(removeScoreFromMarkdown(result.summary))}
                    </div>
                </div>
            )}
        </div>
    );
}