import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-20 h-20 rounded-3xl bg-indigo-500/20 animate-ping" />
        
        {/* Core animated logo container */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-pulse">
          <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
          <span>LearnFlow</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            AI
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1 animate-pulse">
          Loading workspace &amp; curriculum engine...
        </p>

        {/* Elegant horizontal indeterminate progress bar */}
        <div className="w-48 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-2/5 animate-[bounce_1.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
