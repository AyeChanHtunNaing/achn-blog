import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="glass-panel-strong w-full max-w-md rounded-2xl p-8 text-center">
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Not Found</p>
        <h1 className="mb-2 mt-2 font-display text-6xl font-semibold">404</h1>
        <p className="mb-6 text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="glass-accent-soft inline-flex rounded-full px-4 py-2 text-sm font-semibold hover:text-slate-900">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
