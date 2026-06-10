import React from "react";
import Link from "next/link";
import { Wallet, Mail, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-black/5 px-6 py-16 w-full">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
          
          {/* Logo & Description (4 cols) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg shadow-sm group-hover:shadow-md transition-shadow">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-black">
                Finance<span className="gradient-text">Flow</span>
              </span>
            </Link>
            <p className="text-black/60 text-sm max-w-sm leading-relaxed mb-6">
              Log daily expenses in ₹, plan monthly budgets, monitor custom salary cycles, and analyze your financial habits with automated insights.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-purple-100 flex items-center justify-center group transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-black/60 group-hover:text-purple-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-purple-100 flex items-center justify-center group transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-black/60 group-hover:text-purple-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a 
                href="mailto:support@financeflow.com" 
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-purple-100 flex items-center justify-center group transition-colors duration-200"
              >
                <Mail className="w-4 h-4 text-black/60 group-hover:text-purple-600 transition-colors" />
              </a>
            </div>
          </div>

          {/* Links Column 1: Product (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-black text-sm font-bold uppercase tracking-wider mb-1">Product</h4>
            {[
              { label: "Features", href: "#features" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Budget Planner", href: "#budget" },
              { label: "Visual Analytics", href: "#analytics" },
            ].map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href}
                className="text-black/60 text-sm hover:text-purple-600 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Links Column 2: Legal / Company (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-black text-sm font-bold uppercase tracking-wider mb-1">Company</h4>
            {[
              { label: "About Us", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Use", href: "#" },
            ].map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href}
                className="text-black/60 text-sm hover:text-purple-600 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact & Support (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start gap-4">
            <div>
              <h4 className="text-black text-sm font-bold uppercase tracking-wider mb-2">Ready to start?</h4>
              <p className="text-black/60 text-xs leading-relaxed mb-3">
                Join thousands of users tracking their expenses and growing their savings.
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-black text-white hover:bg-purple-700 text-xs font-semibold px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <span>Launch Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Bottom footer */}
        <div className="border-t border-black/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/50">
          <div>
            © {new Date().getFullYear()} FinanceFlow. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Made with ❤️ for smart money management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
