import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-[black]">
      <div className="absolute -top-40 -left-40 h-100 w-100 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-100 w-100 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="z-10 max-w-md">
        {/* Visual Graphic Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
          <Compass className="h-12 w-12 animate-pulse" />
        </div>
        
        {/* Error Details */}
        <h1 className="mt-8 font-outfit text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-650">
          404
        </h1>
        <h2 className="mt-4 font-outfit text-2xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Back Home CTA Button */}
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-750 active:scale-98"
        >
          <Home className="h-4.5 w-4.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
