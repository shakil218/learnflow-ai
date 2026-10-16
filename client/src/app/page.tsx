import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Flame, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Learning Roadmaps &amp; Habit Mastery</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Master Any Skill with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
            AI-Tailored
          </span>{" "}
          Curriculums.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Transform overwhelming technical goals into structured weekly milestones, actionable micro-tasks, and verified knowledge with automated AI assessments.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-500/20">
              Get Started for Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign In to Your Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-200/60 dark:border-zinc-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Engineered for Consistent Skill Acquisition
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to plan, execute, and retain complex knowledge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              AI Curriculum Synthesis
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Input any technology or skill level, and receive a complete, step-by-step roadmap broken down into manageable weekly modules.
            </p>
          </Card>

          <Card hoverEffect className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-500 flex items-center justify-center mb-5">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Habit Streaks &amp; Progress Logic
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Track consecutive study streaks and watch real-time completion progress update automatically as you finish tasks.
            </p>
          </Card>

          <Card hoverEffect className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Interactive Diagnostic Quizzes
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Verify your retention with dynamic multiple-choice assessments complete with rationale explanations for every question.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
