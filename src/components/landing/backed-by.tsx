import React from "react";

const features = [
  { icon: "📊", label: "Expense Growth Charts" },
  { icon: "🥧", label: "Category Pie Charts" },
  { icon: "📅", label: "Daily View Calendar" },
  { icon: "💰", label: "Income Tracking" },
  { icon: "🎯", label: "Budget Goals" },
  { icon: "📥", label: "Excel Export" },
  { icon: "⚙️", label: "Custom Salary Cycle" },
  { icon: "🔒", label: "Clerk Auth" },
];

export const BackedBy: React.FC = () => {
  return (
    <section id="analytics" className="bg-[#F5F5F5] px-6 py-12 w-full">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        {/* Left col (1/4) */}
        <div className="text-black/70 text-base leading-relaxed whitespace-pre-line">
          {"Powered by modern tools\nbuilt for smart money management."}
        </div>

        {/* Right col (3/4) — feature marquee */}
        <div className="md:col-span-3 overflow-hidden relative w-full">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes backers-marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .backers-track {
              display: flex;
              width: max-content;
              animation: backers-marquee 25s linear infinite;
            }
          `}} />

          <div className="backers-track">
            {/* First set */}
            {features.map((feature, i) => (
              <div
                key={`feature-1-${i}`}
                className="mx-6 shrink-0 flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-5 py-2 text-sm font-medium text-black/70 whitespace-nowrap shadow-sm"
              >
                <span className="text-base">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
            {/* Second set for infinite loop */}
            {features.map((feature, i) => (
              <div
                key={`feature-2-${i}`}
                className="mx-6 shrink-0 flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-5 py-2 text-sm font-medium text-black/70 whitespace-nowrap shadow-sm"
              >
                <span className="text-base">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
