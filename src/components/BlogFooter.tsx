import { Link } from "react-router-dom";

export default function BlogFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-white/60 bg-white/20 py-10 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Peace<span className="text-primary">Chan</span>
            </h3>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Personal notes on software engineering, learning, and building things with care.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="glass-accent-soft inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold">
              Home
            </Link>
            <Link to="/login" className="glass-accent-soft inline-flex items-center rounded-xl px-3 py-2 text-xs font-semibold">
              Admin
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/60 pt-5 md:flex-row">
          <p className="text-xs text-slate-500">© {year} Peace Chan. All rights reserved.</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link to="/" className="text-xs font-medium text-slate-500 transition hover:text-slate-900">
              Blog
            </Link>
            <Link to="/login" className="text-xs font-medium text-slate-500 transition hover:text-slate-900">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
