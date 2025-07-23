// Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaCode, FaGithub, FaLaptopCode, FaFileAlt, FaUser, FaHome, FaEnvelope } from "react-icons/fa";

function getInitialMode() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

const navigationItems = [
  {
    path: "/",
    label: "Home",
    icon: FaHome,
    hoverColor: "hover:text-blue-600 dark:hover:text-blue-300",
    activeColor: "text-blue-600 dark:text-blue-300"
  },
  {
    path: "/github",
    label: "GitHub",
    icon: FaGithub,
    hoverColor: "hover:text-gray-800 dark:hover:text-gray-300",
    activeColor: "text-gray-800 dark:text-gray-300"
  },
  {
    path: "/leetcode",
    label: "LeetCode",
    icon: FaLaptopCode,
    hoverColor: "hover:text-orange-600 dark:hover:text-orange-300",
    activeColor: "text-orange-600 dark:text-orange-300"
  },
  {
    path: "/resume",
    label: "Resume",
    icon: FaFileAlt,
    hoverColor: "hover:text-green-600 dark:hover:text-green-300",
    activeColor: "text-green-600 dark:text-green-300"
  },
  {
    path: "/about",
    label: "About",
    icon: FaUser,
    hoverColor: "hover:text-purple-600 dark:hover:text-purple-300",
    activeColor: "text-purple-600 dark:text-purple-300"
  },
  {
    path: "/contact",
    label: "Contact",
    icon: FaEnvelope,
    hoverColor: "hover:text-red-600 dark:hover:text-red-300",
    activeColor: "text-red-600 dark:text-red-300"
  }
];

export default function Navbar() {
  const [dark, setDark] = React.useState(getInitialMode);
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const NavButton = ({ item, index }) => {
    const isActive = location.pathname === item.path;
    const isHovered = hoveredItem === index;
    const IconComponent = item.icon;

    return (
      <Link
        to={item.path}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium
          transition-all duration-300 ease-in-out transform
          ${isActive 
            ? `${item.activeColor} scale-105 shadow-lg` 
            : `text-gray-700 dark:text-gray-200 ${item.hoverColor}`
          }
          ${isHovered ? 'scale-110 -translate-y-1' : ''}
          hover:shadow-md active:scale-95
        `}
        onMouseEnter={() => setHoveredItem(index)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <IconComponent 
          className={`
            transition-all duration-300 ease-in-out
            ${isActive ? 'rotate-12 scale-110' : ''}
            ${isHovered ? 'rotate-6 scale-105' : ''}
          `} 
        />
        <span className="hidden sm:inline-block">{item.label}</span>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full animate-pulse" />
        )}
        
        {/* Hover glow effect */}
        {isHovered && !isActive && (
          <div className="absolute inset-0 bg-current opacity-5 rounded-lg animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-lg transition-all duration-300">
      {/* Logo */}
      <Link 
        to="/" 
        className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 dark:text-blue-400 hover:scale-105 transition-transform duration-300"
      >
        <FaCode className="inline-block animate-pulse" /> 
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DevMetric
        </span>
      </Link>

      {/* Navigation Items */}
      <div className="flex items-center gap-2 flex-wrap">
        {navigationItems.map((item, index) => (
          <NavButton key={item.path} item={item} index={index} />
        ))}

        {/* Theme Toggle Button */}
        <button
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className={`
            ml-4 p-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700
            hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-700 dark:hover:to-gray-600
            transition-all duration-300 transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
            shadow-lg hover:shadow-xl
          `}
          onClick={() => setDark((d) => !d)}
        >
          <span className="transition-all duration-500 ease-in-out flex items-center justify-center">
            {dark ? (
              <FaSun className="text-yellow-400 transition-all duration-500 scale-110 rotate-180" />
            ) : (
              <FaMoon className="text-gray-700 transition-all duration-500 scale-110 -rotate-12" />
            )}
          </span>
        </button>
      </div>
    </nav>
  );
}