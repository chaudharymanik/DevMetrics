import React, { useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Have feedback, questions, or feature requests? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left info panel */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <h3 className="text-xl font-bold mb-6">Contact Info</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Email</p>
                    <p className="font-medium">support@devmetric.app</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Location</p>
                    <p className="font-medium">India</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-blue-200 leading-relaxed">
                  We typically respond within 24 hours. For bug reports, please include steps to reproduce the issue.
                </p>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-[#1e2139] border border-gray-200 dark:border-gray-700 shadow-lg text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                  <FaCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-2xl bg-white dark:bg-[#1e2139] border border-gray-200 dark:border-gray-700 shadow-lg space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#181926] text-gray-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#181926] text-gray-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#181926] text-gray-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FaPaperPlane />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}