"use client";

import React, { useState } from "react";
import { BarChart3, PieChart, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export const ChartsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  const categories = [
    { name: "Food & Dining", amount: "₹8,450", percentage: 35, color: "#8b5cf6", icon: "🍔" },
    { name: "Travel & Fuel", amount: "₹6,030", percentage: 25, color: "#a78bfa", icon: "✈️" },
    { name: "Shopping", amount: "₹4,820", percentage: 20, color: "#c084fc", icon: "🛍️" },
    { name: "Bills & Utilities", amount: "₹2,410", percentage: 10, color: "#ddd6fe", icon: "📄" },
    { name: "Entertainment", amount: "₹2,410", percentage: 10, color: "#e9d5ff", icon: "🎬" },
  ];

  const monthlyData = [
    { month: "Jan", income: 45000, expense: 28000 },
    { month: "Feb", income: 48000, expense: 30000 },
    { month: "Mar", income: 52000, expense: 32000 },
    { month: "Apr", income: 50000, expense: 34000 },
    { month: "May", income: 55000, expense: 31000 },
    { month: "Jun", income: 60000, expense: 35000 },
  ];

  // Calculate coordinates for SVG Donut Chart
  let accumulatedPercentage = 0;
  const donutData = categories.map((cat) => {
    const startAngle = (accumulatedPercentage * 360) / 100;
    accumulatedPercentage += cat.percentage;
    const endAngle = (accumulatedPercentage * 360) / 100;
    
    // Convert angles to coordinates for donut path
    const getCoords = (angle: number, radius: number) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      return {
        x: 100 + radius * Math.cos(rad),
        y: 100 + radius * Math.sin(rad),
      };
    };

    const innerStart = getCoords(startAngle, 50);
    const innerEnd = getCoords(endAngle, 50);
    const outerStart = getCoords(startAngle, 80);
    const outerEnd = getCoords(endAngle, 80);

    const largeArcFlag = cat.percentage > 50 ? 1 : 0;

    return {
      ...cat,
      path: `M ${outerStart.x} ${outerStart.y} A 80 80 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 50 50 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y} Z`,
    };
  });

  return (
    <section id="analytics" className="bg-[#F5F5F5] px-6 py-24 w-full border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-black/60 text-sm font-medium mb-2 uppercase tracking-wider">
            Deep Financial Insights
          </p>
          <h2 
            className="text-black text-5xl md:text-6xl font-bold leading-none mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Visualise Your Progress,<br />
            Understand Every <span className="gradient-text">Rupee</span>.
          </h2>
          <p className="text-black/60 text-lg leading-relaxed max-w-xl">
            No more messy calculations or spreadsheets. FinanceFlow automatically transforms your daily entries into clean, interactive charts to help you build healthy spending habits.
          </p>
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Category Breakdown Card (Donut Chart) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <PieChart className="w-5 h-5 text-purple-700" />
                  </div>
                  <h3 className="text-black text-xl font-bold tracking-tight">Category Breakdown</h3>
                </div>
                <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                  This Month
                </span>
              </div>

              {/* Chart Visualizer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-6">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {donutData.map((slice, i) => (
                      <path
                        key={i}
                        d={slice.path}
                        fill={slice.color}
                        className="transition-all duration-300 cursor-pointer origin-center"
                        style={{
                          transform: activeCategory === slice.name ? "scale(1.05)" : "scale(1)",
                          opacity: activeCategory && activeCategory !== slice.name ? 0.6 : 1,
                        }}
                        onMouseEnter={() => setActiveCategory(slice.name)}
                        onMouseLeave={() => setActiveCategory(null)}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[50px] shadow-inner">
                    <span className="text-black/60 text-xs font-medium uppercase tracking-wider">Total</span>
                    <span className="text-black text-xl font-bold">₹24,120</span>
                  </div>
                </div>

                {/* Categories legends */}
                <div className="flex-1 w-full space-y-3">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors duration-200 cursor-pointer ${
                        activeCategory === cat.name ? "bg-purple-50/70" : "hover:bg-black/5"
                      }`}
                      onMouseEnter={() => setActiveCategory(cat.name)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{cat.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-black text-sm font-semibold leading-tight">{cat.name}</span>
                          <span className="text-black/50 text-xs leading-none">{cat.percentage}% of total</span>
                        </div>
                      </div>
                      <span className="text-black text-sm font-bold">{cat.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-black/5 pt-4 mt-4 flex items-center justify-between text-xs text-black/50 font-medium">
              <span>Smart auto-categorization categorizes 90%+ entries</span>
            </div>
          </div>

          {/* Right: Income vs Expense Comparison Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <BarChart3 className="w-5 h-5 text-purple-700" />
                  </div>
                  <h3 className="text-black text-xl font-bold tracking-tight">Income vs Expenses</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full gradient-bg" />
                    <span className="text-black/70">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                    <span className="text-black/70">Expenses</span>
                  </div>
                </div>
              </div>

              {/* Monthly Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6 px-2">
                {monthlyData.map((data, i) => {
                  const maxVal = 60000;
                  const incHeight = (data.income / maxVal) * 100;
                  const expHeight = (data.expense / maxVal) * 100;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="relative w-full h-full flex items-end justify-center gap-1.5 md:gap-2.5">
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-[105%] bg-black text-white text-xs rounded px-2 py-1 flex flex-col gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-25 min-w-[90px] text-center">
                          <span className="font-semibold text-purple-300">In: ₹{(data.income / 1000).toFixed(0)}k</span>
                          <span className="font-semibold text-pink-300">Out: ₹{(data.expense / 1000).toFixed(0)}k</span>
                        </div>

                        {/* Income Bar */}
                        <div
                          className="w-3 md:w-5 rounded-t-md gradient-bg transition-all duration-300 relative cursor-pointer"
                          style={{ 
                            height: `${incHeight}%`,
                            opacity: activeMonth !== null && activeMonth !== i ? 0.6 : 1
                          }}
                          onMouseEnter={() => setActiveMonth(i)}
                          onMouseLeave={() => setActiveMonth(null)}
                        />
                        {/* Expense Bar */}
                        <div
                          className="w-3 md:w-5 rounded-t-md bg-pink-400 transition-all duration-300 relative cursor-pointer"
                          style={{ 
                            height: `${expHeight}%`,
                            opacity: activeMonth !== null && activeMonth !== i ? 0.6 : 1
                          }}
                          onMouseEnter={() => setActiveMonth(i)}
                          onMouseLeave={() => setActiveMonth(null)}
                        />
                      </div>
                      <span className="text-black/60 text-xs font-semibold mt-3">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-black/5 pt-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black/50 font-medium">
              <div className="flex items-center gap-1.5 text-purple-700">
                <TrendingUp className="w-4 h-4" />
                <span>Average Monthly Savings: 40.5%</span>
              </div>
              <span>Based on typical transaction data</span>
            </div>
          </div>

        </div>

        {/* Large Weekly Flow / Net Worth Wave Chart */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Wallet className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-black text-xl font-bold tracking-tight">Weekly Spending Trend</h3>
                <p className="text-black/50 text-xs mt-0.5">Rolling average of weekly transaction flow</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl p-1 text-xs font-semibold self-start sm:self-center">
              <span className="bg-white text-purple-700 shadow-sm px-3 py-1.5 rounded-lg cursor-pointer">4 Weeks</span>
              <span className="text-black/50 px-3 py-1.5 cursor-pointer hover:text-black">12 Weeks</span>
            </div>
          </div>

          {/* SVG Wave Line Chart */}
          <div className="relative w-full h-48 mt-8">
            <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="1000" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 0 180 Q 150 140, 250 80 T 500 120 T 750 40 T 1000 60 L 1000 200 L 0 200 Z"
                fill="url(#waveGradient)"
              />

              {/* Wave Line path */}
              <path
                d="M 0 180 Q 150 140, 250 80 T 500 120 T 750 40 T 1000 60"
                fill="none"
                stroke="url(#waveStrokeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Gradient for Line stroke */}
              <linearGradient id="waveStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#5b21b6" />
              </linearGradient>

              {/* Interactive nodes */}
              {[
                { x: 0, y: 180, label: "Week 1", amount: "₹4,200" },
                { x: 250, y: 80, label: "Week 2", amount: "₹1,850" },
                { x: 500, y: 120, label: "Week 3", amount: "₹2,900" },
                { x: 750, y: 40, label: "Week 4", amount: "₹820" },
                { x: 1000, y: 60, label: "Week 5", amount: "₹1,430" },
              ].map((node, idx) => (
                <g key={idx} className="cursor-pointer group/node">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="6"
                    className="fill-white stroke-purple-600 stroke-[3px] transition-all duration-200 group-hover/node:r-8 group-hover/node:fill-purple-600 group-hover/node:stroke-white"
                  />
                  {/* Tooltip on node hover */}
                  <foreignObject
                    x={node.x - 50}
                    y={node.y - 50}
                    width="100"
                    height="45"
                    className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none"
                  >
                    <div className="bg-black text-white text-[10px] rounded px-1.5 py-1 text-center flex flex-col shadow-md">
                      <span className="font-semibold text-purple-300 leading-none">{node.label}</span>
                      <span className="font-bold text-white mt-0.5 leading-none">{node.amount}</span>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>
          
          <div className="flex items-center justify-between text-xs text-black/40 font-semibold mt-4">
            <span>Week 1 (Start)</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Current Week</span>
          </div>
        </div>

      </div>
    </section>
  );
};
