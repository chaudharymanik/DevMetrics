import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import GitHubAnalyzer from './pages/GitHubAnalyzer';
import LeetCodeAnalyzer from './pages/LeetCodeAnalyzer';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import './App.css';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/github-analyzer" element={<GitHubAnalyzer />} />
            <Route path="/leetcode-analyzer" element={<LeetCodeAnalyzer />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
export { API_BASE_URL };
