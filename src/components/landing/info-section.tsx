import React from "react";
import { ArrowRight, BarChart3, PiggyBank, Receipt, Calendar, TrendingUp, Download } from "lucide-react";
import Link from "next/link";

export const InfoSection: React.FC = () => {
  return (
    <section id="features" className="bg-[#F5F5F5] px-6 py-24 w-full">
      <div className="max-w-[88rem] mx-auto">
        {/* Row 1: 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <h2 
              className="text-black text-4xl md:text-5xl font-bold leading-tight mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Meet Finance<span className="gradient-text">Flow</span>.
            </h2>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 gradient-bg text-white text-base font-medium pl-6 pr-2 py-2 rounded-full hover:opacity-90 transition-all duration-200 group shadow-md"
            >
              Open Dashboard
              <span className="bg-white rounded-full p-1.5 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </span>
            </Link>
          </div>
          <div>
            <p className="text-black/50 text-xl md:text-2xl leading-relaxed font-light">
              A <span className="text-black font-semibold">smarter, automated way</span> to manage your daily finances. Log expenses in ₹, track category budgets, and get <span className="gradient-text font-semibold">clear visual insights</span> to help you save and grow your wealth effortlessly.
            </p>
          </div>
        </div>

        {/* Row 2: Feature card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Dashboard + Charts (spans 2 cols) */}
          <div 
            className="rounded-2xl lg:col-span-2 p-7 min-h-80 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{
              backgroundImage: "url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <p 
                className="text-black text-2xl font-semibold leading-snug"
                style={{ letterSpacing: "-0.02em" }}
              >
                Smart Dashboard
              </p>
            </div>
            <p className="text-black/70 text-base max-w-xs leading-relaxed">
              See today&apos;s expenses, monthly spend, remaining budget, and savings at a glance. Line charts track your expense growth day by day.
            </p>
          </div>

          {/* Card 2: Budget Tracking */}
          <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg p-2">
                <PiggyBank className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold leading-snug">
                Budget Planner
              </h3>
            </div>
            <p className="text-white/60 text-base leading-relaxed">
              Set monthly budgets per category — Food ₹5,000, Travel ₹3,000, Shopping ₹2,000. Get alerts when you&apos;re close to your limits.
            </p>
          </div>

          {/* Card 3: Expense Categories */}
          <div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg p-2">
                <Receipt className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold leading-snug">
                Smart Categories
              </h3>
            </div>
            <p className="text-white/60 text-base leading-relaxed">
              Auto-categorize expenses — type &quot;biryani&quot; and it goes to 🍔 Food, type &quot;uber&quot; and it&apos;s ✈️ Travel. Pie charts show where your ₹ goes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
