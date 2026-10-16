"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Sparkles, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, QuizQuestionItem, QuizResult } from "@/types/api";
import { Button } from "@/components/ui/Button";

interface QuizViewProps {
  roadmapId: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ roadmapId }) => {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedAnswers({});

    try {
      const res = await apiClient<
        ApiResponse<{
          roadmapTitle: string;
          topic: string;
          questions: QuizQuestionItem[];
        }>
      >(`/api/study/quiz/${roadmapId}`);

      if (res.success && res.data) {
        setQuestions(res.data.questions);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load diagnostic quiz.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = Object.entries(selectedAnswers).map(
      ([qIndex, optIndex]) => ({
        questionIndex: Number(qIndex),
        selectedOption: optIndex,
      })
    );

    try {
      const res = await apiClient<ApiResponse<QuizResult>>("/api/study/quiz/submit", {
        data: {
          roadmapId,
          answers: answersPayload,
        },
      });

      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to evaluate answers.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500 flex flex-col items-center gap-3">
        <Sparkles className="w-6 h-6 animate-spin text-indigo-600" />
        <span>Generating AI knowledge evaluation quiz...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
          {error}
        </div>
      )}

      {/* Result Banner */}
      {result && (
        <div
          className={`p-6 rounded-2xl border ${
            result.passed
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold">
                {result.passed ? "Assessment Passed! 🎉" : "Review & Practice Recommended 💡"}
              </h4>
              <p className="text-sm mt-1 opacity-90">
                You scored {result.score}% ({result.correctCount} of {result.totalQuestions} correct).
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchQuiz}>
              <RefreshCw className="w-4 h-4" />
              Retake Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const gradedInfo = result?.gradedAnswers.find((g) => g.questionIndex === qIndex);

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {q.question}
                </p>
              </div>

              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedAnswers[qIndex] === optIndex;
                  const isCorrect = gradedInfo?.correctOptionIndex === optIndex;
                  const isWrongSelection = isSelected && !gradedInfo?.isCorrect;

                  let optionStyles =
                    "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40";

                  if (isSelected && !result) {
                    optionStyles =
                      "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium";
                  } else if (result) {
                    if (isCorrect) {
                      optionStyles =
                        "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold";
                    } else if (isWrongSelection) {
                      optionStyles =
                        "border-rose-500 bg-rose-50/80 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-semibold";
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyles}`}
                    >
                      <span>{opt}</span>
                      {result && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      {result && isWrongSelection && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                    </button>
                  );
                })}

                {gradedInfo?.explanation && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 italic">
                    💡 Explanation: {gradedInfo.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!result && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={Object.keys(selectedAnswers).length < questions.length}
          >
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
};
