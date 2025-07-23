import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GitHubAnalyzer from "./pages/GitHubAnalyzer";
import LeetCodeAnalyzer from "./pages/LeetCodeAnalyzer";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/github" element={<GitHubAnalyzer />} />
            <Route path="/leetcode" element={<LeetCodeAnalyzer />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
          </Routes>
        </main>
        <Footer />
    </div>
    </Router>
  );
}

export default App;
