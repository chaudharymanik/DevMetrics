import React from "react";

const messages = [
  "Reading your data...",
  "Analyzing patterns...",
  "Consulting AI models...",
  "Generating insights...",
  "Almost done..."
];

export default function AnimatedLoader({ color = "blue", customMessages }) {
  const [step, setStep] = React.useState(0);
  const usedMessages = customMessages || messages;

  React.useEffect(() => {
    if (step < usedMessages.length - 1) {
      const t = setTimeout(() => setStep(step + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [step, usedMessages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className={`animate-spin mb-6 h-12 w-12 text-${color}-500 dark:text-${color}-400`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <div className={`text-lg font-semibold text-${color}-700 dark:text-${color}-300 transition-colors duration-300`}>{usedMessages[step]}</div>
    </div>
  );
} 