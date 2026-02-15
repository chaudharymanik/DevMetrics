import React from "react";
import { FaGithub, FaLaptopCode, FaFileAlt, FaReact, FaNodeJs, FaRobot, FaCheckCircle, FaBullseye, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const analyzers = [
  {
    icon: FaGithub,
    title: "GitHub Profile",
    items: [
      "Profile strength & first impression",
      "Repository quality & health scoring",
      "Tech stack diversity analysis",
      "Recruiter-perspective simulation",
    ],
    color: "text-gray-800 dark:text-gray-200",
    bg: "bg-gray-100 dark:bg-gray-800/50",
    border: "border-gray-200 dark:border-gray-700",
  },
  {
    icon: FaLaptopCode,
    title: "LeetCode Progress",
    items: [
      "DSA proficiency rating",
      "Interview readiness by company tier",
      "Category coverage assessment",
      "Strategic study plan generation",
    ],
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    icon: FaFileAlt,
    title: "Resume / ATS",
    items: [
      "ATS compatibility scoring",
      "Keyword optimization analysis",
      "Formatting & parseability check",
      "Impact & quantification review",
    ],
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
];

const techStack = [
  { icon: FaReact, name: "React", desc: "Frontend framework" },
  { icon: FaNodeJs, name: "Node.js", desc: "Backend runtime" },
  { icon: FaRobot, name: "Gemini AI", desc: "Analysis engine" },
];

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-16 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#181926] dark:to-blue-950 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DevMetric</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            DevMetric is a free, AI-powered platform that gives developers brutally honest, recruiter-grade assessments of their technical profiles — helping them understand exactly where they stand and what to improve.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 p-8 rounded-2xl bg-white dark:bg-[#1e2139] border border-gray-200 dark:border-gray-700 shadow-lg">
            <FaBullseye className="text-3xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Most developers don't know how recruiters and hiring managers actually evaluate their profiles. Generic advice like "contribute to open source" doesn't help. DevMetric bridges this gap by providing detailed, calibrated analysis that mimics how real hiring pipelines assess candidates — from ATS resume scans to GitHub profile reviews to LeetCode readiness checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="px-4 md:px-8 py-16 bg-gray-50 dark:bg-[#14162b]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">What We Analyze</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {analyzers.map((a, i) => (
              <div key={i} className={`p-6 rounded-2xl ${a.bg} border ${a.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
                <a.icon className={`text-3xl ${a.color} mb-4`} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{a.title}</h3>
                <ul className="space-y-3">
                  {a.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <FaCheckCircle className={`${a.color} flex-shrink-0 mt-0.5 text-xs`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-12">Powered By</h2>
          <div className="grid grid-cols-3 gap-8">
            {techStack.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center">
                  <t.icon className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-16 bg-gray-50 dark:bg-[#14162b]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Your Free Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">No sign-up required. Get instant AI-powered feedback.</p>
          <Link
            to="/github-analyzer"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Try It Now
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}