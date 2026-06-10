import Link from "next/link";
import React from "react";

export const Navbar: React.FC = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        {/* Left: Custom logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="FinanceFlow Logo"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-105 duration-200"
          />
          <span className="text-2xl font-extrabold tracking-tight text-black">
            Finance<span className="gradient-text">Flow</span>
          </span>
        </Link>

        {/* Center: Navigation Links matching dashboard features */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Budget", href: "#budget" },
            { label: "Analytics", href: "#analytics" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Go to Dashboard button */}
        <div>
          <Link
            href="/dashboard"
            className="inline-block gradient-bg text-white text-base font-medium px-7 py-2.5 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};
