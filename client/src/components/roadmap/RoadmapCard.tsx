import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { RoadmapItem } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface RoadmapCardProps {
  roadmap: RoadmapItem;
  onDelete?: (id: string) => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap }) => {
  const difficultyVariant = {
    beginner: "emerald",
    intermediate: "indigo",
    advanced: "rose",
  }[roadmap.difficulty] as "emerald" | "indigo" | "rose";

  return (
    <Card hoverEffect className="p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={difficultyVariant} size="sm">
            {roadmap.difficulty.toUpperCase()}
          </Badge>
          {roadmap.aiGenerated && (
            <Badge variant="indigo" size="sm" className="bg-indigo-50/80">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              AI Synthesized
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {roadmap.title}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {roadmap.description || `Study roadmap covering essential principles of ${roadmap.topic}.`}
        </p>

        {/* Progress Display */}
        <div className="mb-4">
          <ProgressBar progress={roadmap.progressPercentage} showLabel />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{roadmap.targetHoursPerWeek} hrs / week</span>
        </div>

        <Link
          href={`/roadmaps/${roadmap._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
        >
          View Roadmap
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
