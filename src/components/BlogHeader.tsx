import { Link, useLocation } from "react-router-dom";
import { PenLine } from "lucide-react";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function BlogHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange((_, session) => {
      setIsAdmin(!!session);
    });
    auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/30 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="group min-w-0 inline-flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="Peace Chan logo"
            className="h-9 w-9 rounded-lg border border-slate-200 shadow-sm"
          />
          <div>
            <p className="font-mono-ui text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
              Peace Chan
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-primary transition-colors leading-none">
              My Blog
            </h1>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="glass-panel hidden md:flex items-center gap-1 rounded-full p-1">
            <Link
              to="/"
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                location.pathname === "/"
                  ? "glass-accent text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Blog
            </Link>
          </nav>
          {isAdmin && (
            <Link
              to="/admin"
              className="glass-accent-soft inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] hover:text-slate-900 transition-colors"
            >
              <PenLine className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
