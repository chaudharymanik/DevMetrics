import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaCode, FaGithub, FaLaptopCode, FaFileAlt, FaUser, FaHome, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";

function getInitialMode() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

const navigationItems = [
  { path: "/", label: "Home", icon: FaHome },
  { path: "/github-analyzer", label: "GitHub", icon: FaGithub },
  { path: "/leetcode-analyzer", label: "LeetCode", icon: FaLaptopCode },
  { path: "/resume-analyzer", label: "Resume", icon: FaFileAlt },
  { path: "/about", label: "About", icon: FaUser },
  { path: "/contact", label: "Contact", icon: FaEnvelope },
];

export default function Navbar() {
  const [dark, setDark] = React.useState(getInitialMode);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on outside click
  React.useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.mobile-menu') && !e.target.closest('.hamburger-btn')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold hover:scale-105 transition-transform duration-300"
        >
          <FaCode className="text-blue-600 dark:text-blue-400" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DevMetric
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                <item.icon className="text-xs" />
                {item.label}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <button
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-2 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? (
              <FaSun className="text-amber-400 text-sm" />
            ) : (
              <FaMoon className="text-gray-600 text-sm" />
            )}
          </button>
        </div>

        {/* Mobile: Theme + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? (
              <FaSun className="text-amber-400 text-sm" />
            ) : (
              <FaMoon className="text-gray-600 text-sm" />
            )}
          </button>
          <button
            className="hamburger-btn p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <FaTimes className="text-gray-600 dark:text-gray-400 text-sm" />
            ) : (
              <FaBars className="text-gray-600 dark:text-gray-400 text-sm" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1 border-t border-gray-200/50 dark:border-gray-800/50">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}