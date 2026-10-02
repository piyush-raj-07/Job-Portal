import { Link } from "react-router-dom"
import { Briefcase, Twitter, Linkedin, Github, ArrowUpRight } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm shadow-blue-600/30">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Job<span className="text-blue-600">Portal</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs mb-6">
              The AI-powered job portal connecting ambitious talent with world-class companies. Your next chapter starts here.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
                { href: "https://github.com", icon: Github, label: "GitHub" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-5 uppercase tracking-widest">Platform</h3>
            <ul className="space-y-3">
              {[
                { label: "Browse Jobs", href: "/jobs" },
                { label: "Sign Up", href: "/signup" },
                { label: "Log In", href: "/login" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-slate-600 hover:text-blue-700 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-5 uppercase tracking-widest">Recruiters</h3>
            <ul className="space-y-3">
              {[
                { label: "Post a Job", href: "/admin/jobs/create" },
                { label: "Manage Jobs", href: "/admin/jobs" },
                { label: "Companies", href: "/admin/companies" },
                { label: "Applications", href: "/admin/companies" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-slate-600 hover:text-blue-700 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-500 text-xs">© 2025 JobPortal. All rights reserved.</p>
          <p className="text-slate-500 text-xs">Built with ❤️ for ambitious professionals</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
