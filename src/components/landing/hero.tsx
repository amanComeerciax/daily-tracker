import React from "react";
import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: "🍔", label: "Food" },
  { icon: "✈️", label: "Travel" },
  { icon: "🛍️", label: "Shopping" },
  { icon: "📄", label: "Bills" },
  { icon: "🎬", label: "Entertainment" },
  { icon: "💊", label: "Health" },
  { icon: "📚", label: "Education" },
  { icon: "📦", label: "Other" },
];

export const Hero: React.FC = () => {
  return (
    <section className="flex-1 px-6 pt-20 pb-6 flex items-end w-full">
      <div 
        className="relative w-full rounded-2xl overflow-hidden" 
        style={{ height: "calc(100vh - 96px)" }}
      >
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover absolute inset-0 w-full h-full"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Wallet className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-black/80">Personal Finance Tracker</span>
          </div>

          <h1 
            className="text-black text-5xl md:text-6xl font-bold leading-tight max-w-xl mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            Track Expenses,<br />Grow Savings
          </h1>
          
          <p 
            className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
          >
            Manage your daily expenses in ₹, set monthly budgets, track income from salary &amp; freelancing, and understand exactly where your money goes — all in one beautiful dashboard.
          </p>

          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-3 gradient-bg text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:opacity-90 transition-all duration-200 group shadow-md"
          >
            Start Tracking Free
            <span className="bg-white rounded-full p-2 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </span>
          </Link>

          {/* Category Marquee — scrolling expense categories */}
          <div className="mt-20 w-full max-w-lg overflow-hidden relative">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes marquee {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .marquee-track {
                display: flex;
                width: max-content;
                animation: marquee 18s linear infinite;
              }
            `}} />
            
            <div className="marquee-track">
              {/* First set */}
              {features.map((cat, i) => (
                <div 
                  key={`cat-1-${i}`} 
                  className="mx-5 shrink-0 flex items-center gap-1.5 bg-white/50 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium text-black/70 whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </div>
              ))}
              {/* Second set for infinite loop */}
              {features.map((cat, i) => (
                <div 
                  key={`cat-2-${i}`} 
                  className="mx-5 shrink-0 flex items-center gap-1.5 bg-white/50 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium text-black/70 whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
