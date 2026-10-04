"use client";

import { useState } from "react";

import type { AiResumeChange } from "@/types/ai";

interface JobMatchBoxProps {
  resumeId: number;
  onApplyChanges: (
    changes: AiResumeChange[]
  ) => void;
}

export default function JobMatchBox({
  resumeId,
  onApplyChanges,
}: JobMatchBoxProps) {
  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] = useState<{
    overallScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    recommendations: string[];
  } | null>(null);

  const [aiAnalysis, setAiAnalysis] =
    useState<{
      matchedKeywords: string[];
      missingKeywords: string[];
      questions: {
        id: string;
        question: string;
        reason: string;
        relatedKeywords: string[];
      }[];
    } | null>(null);

  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [improvements, setImprovements] =
    useState<{
      changes: AiResumeChange[];
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [improvementLoading, setImprovementLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function analyzeJob() {
    if (!jobDescription.trim()) {
      setError("Paste a job description first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/job-match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to analyze job"
        );
      }

      setResult(data.result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzeWithAI() {
    if (!jobDescription.trim()) {
      setError("Paste a job description first.");
      return;
    }

    setAnalysisLoading(true);
    setError("");
    setAiAnalysis(null);
    setImprovements(null);

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/job-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "AI analysis failed"
        );
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function generateResumeImprovements() {
    if (!aiAnalysis) return;

    setImprovementLoading(true);
    setError("");
    setImprovements(null);

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/job-improvements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
            questions: aiAnalysis.questions,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to generate improvements"
        );
      }

      setImprovements(data.improvements);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setImprovementLoading(false);
    }
  }

  function applyChange(change: AiResumeChange) {
    onApplyChanges([change]);

    setImprovements((current) => {
      if (!current) return null;

      return {
        changes: current.changes.filter(
          (item) =>
            item.targetId !== change.targetId
        ),
      };
    });
  }

  function applyAllChanges() {
    if (!improvements) return;

    onApplyChanges(improvements.changes);

    setImprovements({
      changes: [],
    });
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">
        Job Match
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Paste a job description to compare it
        with your resume.
      </p>

      <textarea
        value={jobDescription}
        onChange={(event) =>
          setJobDescription(event.target.value)
        }
        placeholder="Paste job description here..."
        rows={8}
        className="mt-4 w-full rounded-lg border p-3 text-sm"
      />

      <button
        type="button"
        onClick={analyzeJob}
        disabled={loading}
        className="mt-3 w-full rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading
          ? "Analyzing..."
          : "Analyze Job Match"}
      </button>

      <button
        type="button"
        onClick={analyzeWithAI}
        disabled={analysisLoading}
        className="mt-2 w-full rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
      >
        {analysisLoading
          ? "AI Analyzing..."
          : "✨ Analyze With AI"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Match Score
            </p>

            <p className="text-3xl font-bold">
              {result.overallScore}%
            </p>
          </div>

          <div>
            <p className="font-medium">
              Matched Keywords
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {result.matchedKeywords.map(
                (keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-green-100 px-2 py-1 text-xs"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="font-medium">
              Missing Keywords
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {result.missingKeywords.map(
                (keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-red-100 px-2 py-1 text-xs"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="font-medium">
              Recommendations
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {result.recommendations.map(
                (recommendation) => (
                  <li key={recommendation}>
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="mt-5 rounded-xl border p-4">
          <h3 className="font-semibold">
            AI Questions
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Answer these questions to help improve
            your resume for this job.
          </p>

          <div className="mt-4 space-y-4">
            {aiAnalysis.questions.map(
              (question) => (
                <div
                  key={question.id}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <p className="font-medium">
                    {question.question}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {question.reason}
                  </p>

                  <textarea
                    value={
                      answers[question.id] ?? ""
                    }
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]:
                          event.target.value,
                      }))
                    }
                    placeholder="Your answer..."
                    rows={3}
                    className="mt-3 w-full rounded-lg border p-2 text-sm"
                  />
                </div>
              )
            )}

            {aiAnalysis.questions.length > 0 && (
              <button
                type="button"
                onClick={
                  generateResumeImprovements
                }
                disabled={improvementLoading}
                className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {improvementLoading
                  ? "Generating Improvements..."
                  : "Generate Resume Improvements"}
              </button>
            )}

            {aiAnalysis.questions.length === 0 && (
              <p className="text-sm text-gray-500">
                No additional information is needed.
              </p>
            )}
          </div>
        </div>
      )}

      {improvements && (
        <div className="mt-5 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Proposed Resume Changes
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review each change before applying it.
              </p>
            </div>

            {improvements.changes.length > 0 && (
              <button
                type="button"
                onClick={applyAllChanges}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs text-white"
              >
                Accept All
              </button>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {improvements.changes.map(
              (change, index) => (
                <div
                  key={`${change.targetId}-${index}`}
                  className="rounded-lg border p-3"
                >
                  <p className="text-xs font-medium uppercase text-gray-500">
                    {change.section}
                  </p>

                  <p className="mt-2 text-sm">
                    <span className="font-medium">
                      Current:
                    </span>{" "}
                    {change.originalContent}
                  </p>

                  <p className="mt-2 text-sm">
                    <span className="font-medium">
                      Proposed:
                    </span>{" "}
                    {change.newContent}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {change.reason}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyChange(change)
                      }
                      className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setImprovements(
                          (current) =>
                            current
                              ? {
                                  changes:
                                    current.changes.filter(
                                      (_, i) =>
                                        i !== index
                                    ),
                                }
                              : null
                        )
                      }
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            )}

            {improvements.changes.length === 0 && (
              <p className="text-sm text-gray-500">
                All proposed changes have been handled.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}