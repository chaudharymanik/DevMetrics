import React, { useState, useEffect, useRef } from "react";
import { FaGithub, FaLaptopCode, FaFileAlt, FaArrowRight, FaUserCircle, FaSearch, FaBrain, FaChartLine, FaShieldAlt, FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";

function AnimatedCounter({ end, label, icon: Icon, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <Icon className="text-3xl text-blue-500 dark:text-blue-400" />
      <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {count}+
      </span>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}

const features = [
  {
    icon: FaGithub,
    title: "GitHub Analyzer",
    description: "Get a recruiter-grade assessment of your GitHub profile — tech stack analysis, project quality scores, and an actionable improvement roadmap.",
    link: "/github-analyzer",
    color: "from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800",
    iconColor: "text-white",
    border: "border-gray-200 dark:border-gray-700",
    hoverBorder: "hover:border-gray-400 dark:hover:border-gray-500",
  },
  {
    icon: FaLaptopCode,
    title: "LeetCode Analyzer",
    description: "Auto-fetch your LeetCode stats and receive an honest DSA proficiency rating, interview readiness by company tier, and a strategic study plan.",
    link: "/leetcode-analyzer",
    color: "from-orange-500 to-amber-600 dark:from-orange-400 dark:to-amber-500",
    iconColor: "text-white",
    border: "border-orange-200 dark:border-orange-800",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500",
  },
  {
    icon: FaFileAlt,
    title: "Resume Analyzer",
    description: "Upload your resume and get a professional ATS score with formatting analysis, keyword optimization tips, and prioritized recommendations.",
    link: "/resume-analyzer",
    color: "from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500",
    iconColor: "text-white",
    border: "border-green-200 dark:border-green-800",
    hoverBorder: "hover:border-green-400 dark:hover:border-green-500",
  },
];

const steps = [
  { icon: FaUserCircle, title: "Enter Your Profile", desc: "Paste your GitHub username, LeetCode profile, or upload your resume." },
  { icon: FaBrain, title: "AI Analyzes", desc: "Our Gemini-powered AI performs a deep, multi-dimensional analysis." },
  { icon: FaChartLine, title: "Get Insights", desc: "Receive a comprehensive report with scores, benchmarks, and action items." },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#181926] dark:to-blue-950 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 animate-fade-in">
            <FaBolt className="text-amber-500" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight animate-fade-in">
            Analyze. Improve.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Stand Out.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Get AI-powered, recruiter-grade insights on your GitHub profile, LeetCode progress, and resume — all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <Link
              to="/github-analyzer"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-lg hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-0.5"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 md:px-8 -mt-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-6 p-8 bg-white/80 dark:bg-[#1e2139]/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <AnimatedCounter end={3} label="AI Analyzers" icon={FaSearch} duration={1000} />
            <AnimatedCounter end={10} label="Analysis Dimensions" icon={FaShieldAlt} duration={1500} />
            <AnimatedCounter end={100} label="Free to Use" icon={FaBolt} duration={2000} />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Three Powerful Analyzers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Each tool delivers a comprehensive, brutally honest assessment to help you level up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Link
                key={i}
                to={f.link}
                className={`group relative p-8 rounded-2xl bg-white dark:bg-[#1e2139] border ${f.border} ${f.hoverBorder} shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-full" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />

                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${f.color} mb-6 shadow-lg`}>
                  <f.icon className={`text-2xl ${f.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {f.description}
                </p>

                <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Try Now <FaArrowRight className="text-xs" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 md:px-8 py-20 md:py-28 bg-gray-50 dark:bg-[#14162b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Three simple steps to actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 dark:from-blue-700 dark:via-purple-700 dark:to-blue-700" />

            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <s.icon className="text-white text-xl" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#1e2139] border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Stop guessing where you stand. Get data-driven, AI-powered insights that tell you exactly what to improve.
          </p>
          <Link
            to="/github-analyzer"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Your Analysis
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}