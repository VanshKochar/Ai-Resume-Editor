"use client";

import { useEffect, useState } from "react";

type Version = {
  id: number;
  versionNumber: number;
  createdBy: string;
  changeSummary: string | null;
  createdAt: string;
};

type VersionHistoryProps = {
  resumeId: number;
  currentVersionNumber: number;
  onRestore: () => void;
};

export default function VersionHistory({
  resumeId,
  currentVersionNumber,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  async function loadVersions() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/resumes/${resumeId}/versions/history`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to load versions"
        );
      }

      setVersions(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load versions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVersions();
  }, [resumeId, currentVersionNumber]);

  async function restoreVersion(versionId: number) {
    const confirmed = window.confirm(
      "Restore this version? This will create a new version."
    );

    if (!confirmed) {
      return;
    }

    try {
      setRestoring(versionId);
      setError("");

      const response = await fetch(
        `/api/resumes/${resumeId}/versions/${versionId}/restore`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to restore version"
        );
      }

      onRestore();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to restore version"
      );
    } finally {
      setRestoring(null);
    }
  }

  return (
    <aside className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">
        Version History
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading versions...
        </p>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && versions.length === 0 && (
        <p className="text-sm text-gray-500">
          No versions found.
        </p>
      )}

      <div className="space-y-3">
        {versions.map((version) => (
          <div
            key={version.id}
            className="rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Version {version.versionNumber}
                </p>

                <p className="text-xs text-gray-500">
                  {version.createdBy}
                </p>
              </div>

              {version.versionNumber ===
                currentVersionNumber && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                  Current
                </span>
              )}
            </div>

            {version.changeSummary && (
              <p className="mt-2 text-sm text-gray-600">
                {version.changeSummary}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
              {new Date(
                version.createdAt
              ).toLocaleString()}
            </p>

            {version.versionNumber !==
              currentVersionNumber && (
              <button
                onClick={() =>
                  restoreVersion(version.id)
                }
                disabled={restoring === version.id}
                className="mt-3 text-sm font-medium underline disabled:opacity-50"
              >
                {restoring === version.id
                  ? "Restoring..."
                  : "Restore this version"}
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}