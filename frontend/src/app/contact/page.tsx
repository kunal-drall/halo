"use client";

import { useState } from "react";
import Link from "next/link";

const contactChannels = [
  {
    label: "Email",
    value: "hello@haloprotocol.io",
    href: "mailto:hello@haloprotocol.io",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    value: "@HaloProtocol",
    href: "https://twitter.com/HaloProtocol",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    value: "halo-protocol",
    href: "https://github.com/halo-protocol",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    value: "HaloProtocol",
    href: "https://t.me/HaloProtocol",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Contact Us
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question, partnership inquiry, or just want to say hello?
            Reach out through any of our channels or use the form below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Channels */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">
              Get in Touch
            </h2>
            <div className="space-y-4">
              {contactChannels.map((channel) => (
                <Link
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-5 flex items-center gap-4 glass-card-hover block"
                >
                  <div className="w-12 h-12 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
                    {channel.icon}
                  </div>
                  <div>
                    <p className="text-sm text-white/40">{channel.label}</p>
                    <p className="text-white font-medium">{channel.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">
              Send a Message
            </h2>
            <div className="glass-card p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-green-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-green-400 font-semibold text-lg mb-2">
                    Message Sent!
                  </p>
                  <p className="text-white/40 text-sm">
                    Thank you for reaching out. We will get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-white/50 hover:text-white transition-colors underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm text-white/40 mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm text-white/40 mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm text-white/40 mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="How can we help?"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-white text-[#0B0F1A] px-6 py-3 font-semibold hover:bg-white/90 transition-colors"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
