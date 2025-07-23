import React, { useState, useEffect } from "react";
import { FaRocket, FaGithub, FaLightbulb, FaLinkedin } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [showOptions, setShowOptions] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    setShowOptions((v) => !v);
  };

  const handleOption = (path) => {
    setShowOptions(false);
    navigate(path);
  };

  const handleImageLoad = () => {
    setImgLoaded(true);
    // Only animate on the very first load
    if (initialLoad) {
      setInitialLoad(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-10 md:py-13 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
        <div className="flex-1 flex flex-col justify-center items-start min-w-[220px]">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 mt-4 text-gray-900 dark:text-white leading-tight">
            Be an <span className="text-blue-600 dark:text-blue-400">Intelligent Developer</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-6 md:mb-8 max-w-xl">
            Get actionable insights on your GitHub portfolio. Analyze, improve, and showcase your developer journey with the power of AI.
          </p>
          <div className="flex gap-4 mb-6 md:mb-8 relative">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold text-lg shadow transition-transform duration-200 ease-in-out animate-bounce-slow"
            >
              Get Started
            </button>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
            >
              <FaGithub /> GitHub
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
            >
              <FaLinkedin /> LinkedIn
            </a>
            {showOptions && (
              <div className="absolute left-0 top-16 z-20 bg-white dark:bg-[#23263a] border border-gray-200 dark:border-blue-900 rounded-lg shadow-lg p-4 flex flex-col gap-2 w-56 animate-fade-in">
                <button onClick={() => handleOption("/github")}
                  className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">GitHub Analyzer</button>
                <button onClick={() => handleOption("/leetcode")}
                  className="w-full text-left px-4 py-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold">LeetCode Analyzer</button>
                <button onClick={() => handleOption("/resume")}
                  className="w-full text-left px-4 py-2 rounded hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 font-semibold">Resume Analyzer</button>
              </div>
            )}
          </div>
          <div className="flex gap-6 mt-2 md:mt-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><FaLightbulb /> AI-Powered</div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><FaRocket /> Fast & Insightful</div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center min-w-[220px]">
          <img
            src="https://img.freepik.com/free-photo/rear-view-programmer-working-all-night-long_1098-18697.jpg?semt=ais_hybrid&w=740"
            alt="Developer Portfolio"
            className={`w-full max-w-md rounded-xl shadow-2xl border-4 border-blue-100 ${imgLoaded && initialLoad ? 'animate-fade-in' : ''} block dark:hidden`}
            onLoad={handleImageLoad}
          />
          <img
            src="https://img.freepik.com/free-photo/rear-view-programmer-working-all-night-long_1098-18697.jpg?semt=ais_hybrid&w=740"
            alt="Developer Portfolio Dark"
            className={`w-full max-w-md rounded-xl shadow-2xl border-4 border-blue-900 ${imgLoaded && initialLoad ? 'animate-fade-in' : ''} hidden dark:block`}
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    </div>
  );
}