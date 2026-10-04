"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type Analysis = {
  overallScore: number;
  contentScore: number;
  keywordScore: number;
  formattingScore: number;
  structureScore: number;
  issues: {
    type: string;
    message: string;
  }[];
  suggestions: {
    category: string;
    message: string;
  }[];
};

export default function AtsPage() {
  const params = useParams();

  const resumeId = params.resumeId as string;

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function analyze() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/resumes/${resumeId}/ats`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to analyze resume"
        );
      }

      setAnalysis(data.analysis);
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          ATS Analyzer
        </h1>

        <p className="mt-2 text-gray-600">
          Analyze the latest saved version of your resume.
        </p>

        <button
          onClick={analyze}
          disabled={loading}
          className="mt-6 rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Analyzing..."
            : "Analyze Resume"}
        </button>

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <section className="rounded-xl border bg-white p-6">
              <p className="text-sm text-gray-500">
                Overall ATS Score
              </p>

              <p className="mt-2 text-5xl font-bold">
                {analysis.overallScore}
              </p>
            </section>

            <section className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-semibold">
                Score Breakdown
              </h2>

              <div className="mt-4 space-y-3">
                <p>
                  Content:{" "}
                  <strong>
                    {analysis.contentScore}
                  </strong>
                </p>

                <p>
                  Keywords:{" "}
                  <strong>
                    {analysis.keywordScore}
                  </strong>
                </p>

                <p>
                  Formatting:{" "}
                  <strong>
                    {analysis.formattingScore}
                  </strong>
                </p>

                <p>
                  Structure:{" "}
                  <strong>
                    {analysis.structureScore}
                  </strong>
                </p>
              </div>
            </section>

            <section className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-semibold">
                Issues
              </h2>

              <div className="mt-4 space-y-3">
                {analysis.issues.length === 0 ? (
                  <p className="text-gray-600">
                    No major issues detected.
                  </p>
                ) : (
                  analysis.issues.map(
                    (issue, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3"
                      >
                        <p className="text-xs uppercase text-gray-500">
                          {issue.type}
                        </p>

                        <p className="mt-1">
                          {issue.message}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </section>

            <section className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-semibold">
                Suggestions
              </h2>

              <div className="mt-4 space-y-3">
                {analysis.suggestions.map(
                  (suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-3"
                    >
                      <p className="font-medium">
                        {suggestion.category}
                      </p>

                      <p className="mt-1 text-gray-600">
                        {suggestion.message}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}