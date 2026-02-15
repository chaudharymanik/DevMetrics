import React from "react";

const messages = [
  "Reading your data...",
  "Analyzing patterns...",
  "Consulting AI models...",
  "Generating insights...",
  "Almost done..."
];

const colorMap = {
  blue: {
    spinner: "text-blue-500 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  purple: {
    spinner: "text-purple-500 dark:text-purple-400",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500 dark:bg-purple-400",
  },
  green: {
    spinner: "text-green-500 dark:text-green-400",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500 dark:bg-green-400",
  },
};

export default function AnimatedLoader({ color = "blue", customMessages }) {
  const [step, setStep] = React.useState(0);
  const usedMessages = customMessages || messages;
  const colors = colorMap[color] || colorMap.blue;

  React.useEffect(() => {
    if (step < usedMessages.length - 1) {
      const t = setTimeout(() => setStep(step + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [step, usedMessages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className={`animate-spin mb-6 h-10 w-10 ${colors.spinner}`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <div className={`text-lg font-semibold ${colors.text} transition-all duration-300 mb-4`}>
        {usedMessages[step]}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`}
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}