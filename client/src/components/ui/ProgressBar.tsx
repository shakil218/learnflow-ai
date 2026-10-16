import React from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
  showLabel = false,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
          <span>Overall Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            clampedProgress === 100
              ? "bg-emerald-500"
              : clampedProgress > 60
              ? "bg-indigo-600"
              : clampedProgress > 30
              ? "bg-violet-500"
              : "bg-amber-500"
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
