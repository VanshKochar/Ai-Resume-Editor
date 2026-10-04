import { useState } from "react";

export function useResumeHistory<T>(initialValue: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialValue);
  const [future, setFuture] = useState<T[]>([]);

  function update(value: T) {
    setPast((currentPast) => [
      ...currentPast,
      present,
    ]);

    setPresent(value);
    setFuture([]);
  }

  function undo() {
    if (past.length === 0) {
      return;
    }

    const previous = past[past.length - 1];

    setPast((currentPast) =>
      currentPast.slice(0, -1)
    );

    setFuture((currentFuture) => [
      present,
      ...currentFuture,
    ]);

    setPresent(previous);
  }

  function redo() {
    if (future.length === 0) {
      return;
    }

    const next = future[0];

    setFuture((currentFuture) =>
      currentFuture.slice(1)
    );

    setPast((currentPast) => [
      ...currentPast,
      present,
    ]);

    setPresent(next);
  }

  function reset(value: T) {
    setPast([]);
    setPresent(value);
    setFuture([]);
  }

  return {
    value: present,
    update,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}