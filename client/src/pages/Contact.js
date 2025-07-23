import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className="px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FaEnvelope className="text-3xl text-blue-600 dark:text-blue-400" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contact</h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#181926] border border-gray-200 dark:border-blue-800 rounded-lg shadow p-8 flex flex-col gap-4 transition-colors duration-300">
        <input className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#23263a] text-gray-900 dark:text-blue-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors duration-200" type="text" placeholder="Your Name" required />
        <input className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#23263a] text-gray-900 dark:text-blue-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors duration-200" type="email" placeholder="Your Email" required />
        <textarea className="border border-gray-300 dark:border-blue-800 bg-white dark:bg-[#23263a] text-gray-900 dark:text-blue-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition-colors duration-200" placeholder="Your Message" rows={4} required />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold" type="submit">Send</button>
        {sent && <div className="text-green-600 mt-2">Message sent! (Not really, this is a demo.)</div>}
      </form>
    </div>
  );
} 