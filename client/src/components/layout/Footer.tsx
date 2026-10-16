import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>
            LearnFlow AI &copy; {new Date().getFullYear()} — Built for intelligent, self-paced learning.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Roadmaps
          </Link>
          <Link href="/study" className="hover:text-indigo-600 transition-colors">
            Study Habit
          </Link>
        </div>
      </div>
    </footer>
  );
};
