import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pickRandom } from "../utils/random";

export type TouchPoint = {
  id: number;
  x: number;
  y: number;
};

export type Winner = {
  touchId: number;
  playerIndex: number;
  label: string;
  x: number;
  y: number;
};

type RoundPhase = "ready" | "holding" | "reveal";

const HOLD_DURATION_MS = 5000;
const MIN_PLAYERS = 2;

const sortTouches = (touches: TouchPoint[]) =>
  [...touches].sort((a, b) => a.id - b.id);

const isSameIdSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const usePickerState = () => {
  const [phase, setPhase] = useState<RoundPhase>("ready");
  const [activeTouches, setActiveTouches] = useState<TouchPoint[]>([]);
  const [remainingMs, setRemainingMs] = useState(HOLD_DURATION_MS);
  const [winner, setWinner] = useState<Winner | null>(null);

  const holdStartRef = useRef<number | null>(null);
  const lockedTouchIdsRef = useRef<number[]>([]);
  const activeTouchesRef = useRef<TouchPoint[]>([]);

  useEffect(() => {
    activeTouchesRef.current = activeTouches;
  }, [activeTouches]);

  const resetForNewRound = useCallback(() => {
    holdStartRef.current = null;
    lockedTouchIdsRef.current = [];
    setActiveTouches([]);
    setPhase("ready");
    setRemainingMs(HOLD_DURATION_MS);
    setWinner(null);
  }, []);

  const beginHold = useCallback((touchIds: number[]) => {
    holdStartRef.current = Date.now();
    lockedTouchIdsRef.current = touchIds;
    setPhase("holding");
    setRemainingMs(HOLD_DURATION_MS);
  }, []);

  const updateTouches = useCallback(
    (touches: TouchPoint[]) => {
      const sortedTouches = sortTouches(touches);
      const touchIds = sortedTouches.map((touch) => touch.id);

      setActiveTouches(sortedTouches);

      if (phase === "reveal") {
        return;
      }

      if (touchIds.length < MIN_PLAYERS) {
        setPhase("ready");
        setRemainingMs(HOLD_DURATION_MS);
        holdStartRef.current = null;
        lockedTouchIdsRef.current = [];
        return;
      }

      if (phase === "ready") {
        beginHold(touchIds);
        return;
      }

      if (!isSameIdSet(lockedTouchIdsRef.current, touchIds)) {
        beginHold(touchIds);
      }
    },
    [beginHold, phase],
  );

  useEffect(() => {
    if (phase !== "holding") {
      return;
    }

    const interval = setInterval(() => {
      if (!holdStartRef.current) {
        return;
      }

      const currentTouches = activeTouchesRef.current;
      const currentIds = sortTouches(currentTouches).map((touch) => touch.id);

      if (currentIds.length < MIN_PLAYERS) {
        setPhase("ready");
        setRemainingMs(HOLD_DURATION_MS);
        holdStartRef.current = null;
        lockedTouchIdsRef.current = [];
        setActiveTouches([]);
        return;
      }

      if (!isSameIdSet(lockedTouchIdsRef.current, currentIds)) {
        holdStartRef.current = Date.now();
        lockedTouchIdsRef.current = currentIds;
        setRemainingMs(HOLD_DURATION_MS);
        return;
      }

      const elapsed = Date.now() - holdStartRef.current;
      const nextRemaining = Math.max(0, HOLD_DURATION_MS - elapsed);
      setRemainingMs(nextRemaining);

      if (nextRemaining > 0) {
        return;
      }

      const lockedIds = lockedTouchIdsRef.current;
      const participants = activeTouchesRef.current.filter((touch) =>
        lockedIds.includes(touch.id),
      );
      const selected = pickRandom(participants);

      if (!selected) {
        resetForNewRound();
        return;
      }

      const ordered = sortTouches(participants);
      const index = ordered.findIndex((touch) => touch.id === selected.id);

      setWinner({
        touchId: selected.id,
        playerIndex: index,
        label: `Player ${index + 1}`,
        x: selected.x,
        y: selected.y,
      });
      setPhase("reveal");
    }, 50);

    return () => clearInterval(interval);
  }, [phase, resetForNewRound]);

  const countdownSeconds = useMemo(
    () => Math.max(0, Math.ceil(remainingMs / 1000)),
    [remainingMs],
  );

  return {
    MIN_PLAYERS,
    activeTouches,
    countdownSeconds,
    phase,
    updateTouches,
    winner,
    resetForNewRound,
  };
};
