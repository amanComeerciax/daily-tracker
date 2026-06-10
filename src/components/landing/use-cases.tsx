import React from "react";
import { ArrowRight, Calendar, TrendingUp, Download } from "lucide-react";
import Link from "next/link";

export const UseCases: React.FC = () => {
  return (
    <section id="budget" className="bg-[#F5F5F5] px-6 py-24 w-full">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left column */}
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm font-medium mb-2 uppercase tracking-wider">
            How It Works
          </p>
          <h2 
            className="text-black text-5xl md:text-6xl font-bold leading-none mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your Money,<br />Your Way
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm mb-8">
            Whether your salary comes on the 1st or the 10th, FinanceFlow adapts. Set your custom billing cycle, track daily spending in ₹, and export everything to Excel for accounting.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Calendar className="w-4 h-4 text-purple-700" />
              </div>
              <span className="text-black/80 text-sm font-medium">Daily, Weekly &amp; Monthly expense views</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-purple-700" />
              </div>
              <span className="text-black/80 text-sm font-medium">Track Salary, Freelancing &amp; Business income</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Download className="w-4 h-4 text-purple-700" />
              </div>
              <span className="text-black/80 text-sm font-medium">Export to Excel with one click</span>
            </div>
          </div>
        </div>

        {/* Right column — split: text top (white), video bottom */}
        <div className="rounded-3xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Top: Text content on white background */}
          <div className="p-10 pb-4 md:p-12 md:pb-4 flex flex-col items-start">
            <h3 
              className="text-black text-4xl md:text-5xl font-bold leading-tight mb-5"
              style={{ letterSpacing: "-0.03em" }}
            >
              Quick Add
            </h3>
            <p className="text-black/70 text-base max-w-md mb-6 leading-relaxed">
              Add expenses in seconds — just type amount &amp; description. Smart auto-categorization maps &quot;chai ₹20&quot; to Food, &quot;petrol ₹500&quot; to Travel, &quot;Netflix ₹199&quot; to Bills. No manual sorting needed.
            </p>

            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 gradient-bg text-white text-base font-medium pl-6 pr-2 py-2 rounded-full hover:opacity-90 transition-all duration-200 group shadow-md"
            >
              <span>Try it now</span>
              <span className="bg-white rounded-full p-1.5 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </span>
            </Link>
          </div>

          {/* Bottom: Video/image area — fits the container width and height perfectly */}
          <div className="relative h-[380px] md:h-[480px] w-full overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-bottom"
            >
              <source 
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4" 
                type="video/mp4" 
              />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};
