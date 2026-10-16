import React from "react";
import { FolderX, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
        {icon ?? <FolderX className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          <Plus className="w-4 h-4" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
