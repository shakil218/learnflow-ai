"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Compass } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, RoadmapItem } from "@/types/api";
import { RoadmapCard } from "@/components/roadmap/RoadmapCard";
import { AiRoadmapGenerator } from "@/components/roadmap/AiRoadmapGenerator";
import { CreateRoadmapForm } from "@/components/roadmap/CreateRoadmapForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoadmapCardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const fetchRoadmaps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<ApiResponse<RoadmapItem[]>>("/api/roadmaps");
      if (res.success && res.data) {
        setRoadmaps(res.data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load roadmaps.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchRoadmaps();
    }
  }, [session, isSessionPending, router, fetchRoadmaps]);

  const handleRoadmapCreated = (newRoadmap: RoadmapItem) => {
    setIsAiModalOpen(false);
    setIsManualModalOpen(false);
    setRoadmaps((prev) => [newRoadmap, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Learning Roadmaps
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your personalized milestones, completed modules, and study pace
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={() => setIsManualModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            Custom Roadmap
          </Button>
          <Button
            onClick={() => setIsAiModalOpen(true)}
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-initial"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            AI Generator
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchRoadmaps}>
            Retry
          </Button>
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoadmapCardSkeleton />
          <RoadmapCardSkeleton />
          <RoadmapCardSkeleton />
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState
          title="No Learning Roadmaps Yet"
          description="Synthesize your first customized curriculum using our AI Generator or build one from scratch."
          actionText="Generate with AI"
          onAction={() => setIsAiModalOpen(true)}
          icon={<Compass className="w-8 h-8 text-indigo-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap._id} roadmap={roadmap} />
          ))}
        </div>
      )}

      {/* AI Generator Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Synthesize AI Learning Curriculum"
      >
        <AiRoadmapGenerator
          onSuccess={handleRoadmapCreated}
          onCancel={() => setIsAiModalOpen(false)}
        />
      </Modal>

      {/* Manual Creation Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Create Custom Learning Roadmap"
      >
        <CreateRoadmapForm
          onSuccess={handleRoadmapCreated}
          onCancel={() => setIsManualModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
