"use client";

import { useState } from "react";

interface AiEditBoxProps {
  resumeId: number;
  section: string;
  targetId: string;
  currentContent: string;
  selectedText: string;
  onAccept: (
    newContent: string,
    changeScope: "selection" | "bullet"
  ) => void;
  onClose: () => void;
}

export default function AiEditBox({
  resumeId,
  section,
  targetId,
  currentContent,
  selectedText,
  onAccept,
  onClose,
}: AiEditBoxProps) {
  const [instruction, setInstruction] =
    useState("");

  const [suggestion, setSuggestion] =
    useState<{
      originalContent: string;
      selectedText: string;
      changeScope: "selection" | "bullet";
      newContent: string;
      reason: string;
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function generateSuggestion() {
    if (!instruction.trim()) {
      setError(
        "Please enter an instruction."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuggestion(null);

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/ai/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section,
            targetId,
            currentContent,
            selectedText,
            instruction,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to generate suggestion"
        );
      }

      setSuggestion(
        data.suggestion
      );
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

  function acceptSuggestion() {
    if (!suggestion) return;

    onAccept(
      suggestion.newContent,
      suggestion.changeScope
    );

    setSuggestion(null);
    setInstruction("");
  }

  return (
    <div className="w-80 rounded-xl border bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">
          ✨ AI Edit
        </p>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>
      </div>

      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <p className="text-xs font-medium text-gray-500">
          Selected text
        </p>

        <p className="mt-1 text-sm">
          {selectedText}
        </p>
      </div>

      <textarea
        value={instruction}
        onChange={(event) =>
          setInstruction(
            event.target.value
          )
        }
        placeholder="What should AI change?"
        className="w-full rounded-lg border p-2 text-sm"
        rows={3}
      />

      <button
        type="button"
        onClick={generateSuggestion}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading
          ? "Generating..."
          : "Generate"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {suggestion && (
        <div className="mt-3 rounded-lg border p-3">
          <p className="text-xs font-medium text-gray-500">
            AI Suggestion
          </p>

          <p className="mt-2 text-sm">
            {suggestion.newContent}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Scope:{" "}
            {suggestion.changeScope ===
            "selection"
              ? "Selected text"
              : "Whole target"}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            {suggestion.reason}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={
                acceptSuggestion
              }
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
            >
              Accept
            </button>

            <button
              type="button"
              onClick={() =>
                setSuggestion(null)
              }
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}