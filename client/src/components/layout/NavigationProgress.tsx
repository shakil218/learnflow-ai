"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export const NavigationProgress: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Only triggers on initial page mount / browser reload (not on page switching)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 120);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, []); // Empty dependency array ensures it only executes on initial mount / reload!

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-xs w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Glowing Logo Icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-2xl bg-indigo-500/20 animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white animate-spin" style={{ animationDuration: "2.5s" }} />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
          <span>LearnFlow</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            AI
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          Initializing study workspace...
        </p>

        {/* Center Progress Bar with percentage */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
