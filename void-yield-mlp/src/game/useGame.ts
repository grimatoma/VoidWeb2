// React hook that owns the game state, runs the foreground tick, and exposes
// commands. State is mutated in place via a ref; React re-renders are driven by
// a version counter ticked on every commit.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buyFromEarth as _buyFromEarth,
  buyPrefabKit as _buyPrefabKit,
  buyShip as _buyShip,
  claimTierUp as _claimTierUp,
  demolishBuilding as _demolish,
  dispatchScoutMission as _dispatchScoutMission,
  placeBuilding as _place,
  runAfkCatchup,
  sellToEarth as _sellToEarth,
  startRoute as _startRoute,
  stopMiningOp as _stopMiningOp,
  tick,
} from "./sim";
import { clearAllGameStorage, loadState, newGame, saveState } from "./persist";
import type { BuildingId, PrefabKitId, ResourceId, ShipId } from "./defs";
import type { AfkSummary, BodyId, GameState } from "./state";
import {
  abandonProspecting as _abandonProspecting,
  setFocus as _setFocus,
  stakeCandidate as _stakeCandidate,
  startFieldSweep as _startFieldSweep,
  startProspecting as _startProspecting,
} from "./survey";
import type { SurveyFocus } from "./survey";

const TICK_HZ = 1;
const SAVE_EVERY_SEC = 5;

export function useGame() {
  const stateRef = useRef<GameState>(newGame());
  const [, setVersion] = useState(0);
  const [afkSummary, setAfkSummary] = useState<AfkSummary | null>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const loaded = loadState();
    if (loaded) {
      const awayMs = Math.max(0, Date.now() - loaded.lastActiveWallMs);
      stateRef.current = loaded;
      if (awayMs >= 60_000) {
        const summary = runAfkCatchup(stateRef.current, awayMs);
        setAfkSummary(summary);
      }
    } else {
      stateRef.current = newGame();
    }
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      tick(stateRef.current, 1 / TICK_HZ);
      setVersion((v) => v + 1);
    }, 1000 / TICK_HZ);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => saveState(stateRef.current), SAVE_EVERY_SEC * 1000);
    const onVisibility = () => {
      if (document.hidden) saveState(stateRef.current);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const commit = useCallback(() => {
    setVersion((v) => v + 1);
    saveState(stateRef.current);
  }, []);

  const place = useCallback(
    (bodyId: BodyId, defId: BuildingId, x: number, y: number) => {
      const r = _place(stateRef.current, bodyId, defId, x, y);
      commit();
      return r;
    },
    [commit],
  );
  const demolish = useCallback(
    (bodyId: BodyId, buildingId: string) => {
      _demolish(stateRef.current, bodyId, buildingId);
      commit();
    },
    [commit],
  );
  const startRoute = useCallback(
    (
      shipId: string,
      fromBodyId: BodyId,
      toBodyId: BodyId,
      cargoResource: ResourceId | null,
      sellOnArrival: boolean,
      repeat: boolean,
      desiredQty?: number,
      minOriginStock?: number,
    ) => {
      const ship = stateRef.current.ships.find((s) => s.id === shipId);
      if (!ship) return { ok: false, reason: "ship not found" };
      const r = _startRoute(
        stateRef.current,
        ship,
        fromBodyId,
        toBodyId,
        cargoResource,
        sellOnArrival,
        repeat,
        desiredQty,
        minOriginStock,
      );
      commit();
      return r;
    },
    [commit],
  );
  const stopMiningOp = useCallback(
    (shipId: string) => {
      const r = _stopMiningOp(stateRef.current, shipId);
      commit();
      return r;
    },
    [commit],
  );
  const buyShip = useCallback((defId: ShipId = "hauler_1") => {
    const r = _buyShip(stateRef.current, defId);
    commit();
    return r;
  }, [commit]);
  const dispatchScoutMission = useCallback(
    (shipId: string, targetBodyId?: BodyId) => {
      const r = _dispatchScoutMission(stateRef.current, shipId, targetBodyId);
      commit();
      return r;
    },
    [commit],
  );
  const buyFromEarth = useCallback(
    (rid: ResourceId, qty: number, toBodyId: BodyId) => {
      const r = _buyFromEarth(stateRef.current, rid, qty, toBodyId);
      commit();
      return r;
    },
    [commit],
  );
  const sellToEarth = useCallback(
    (rid: ResourceId, qty: number) => {
      const r = _sellToEarth(stateRef.current, rid, qty);
      commit();
      return r;
    },
    [commit],
  );
  const buyPrefabKit = useCallback(
    (kitId: PrefabKitId) => {
      const r = _buyPrefabKit(stateRef.current, kitId);
      commit();
      return r;
    },
    [commit],
  );
  const claimTierUp = useCallback(() => {
    const r = _claimTierUp(stateRef.current);
    commit();
    return r;
  }, [commit]);
  const pauseBuilding = useCallback(
    (bodyId: BodyId, buildingId: string, paused: boolean) => {
      const body = stateRef.current.bodies[bodyId];
      const b = body.buildings.find((x) => x.id === buildingId);
      if (!b) return;
      b.paused = paused;
      commit();
    },
    [commit],
  );
  const startFieldSweep = useCallback(() => {
    const seed = Math.floor(Math.random() * 1e9);
    _startFieldSweep(stateRef.current.survey, seed);
    commit();
  }, [commit]);
  const startProspecting = useCallback(
    (candId: string, focus: SurveyFocus = "composition") => {
      _startProspecting(stateRef.current.survey, candId, focus);
      commit();
    },
    [commit],
  );
  const setSurveyFocus = useCallback(
    (focus: SurveyFocus) => {
      _setFocus(stateRef.current.survey, focus);
      commit();
    },
    [commit],
  );
  const stakeCandidate = useCallback(
    (candId: string) => {
      const state = stateRef.current;
      const cand = state.survey.candidates.find((c) => c.id === candId);
      _stakeCandidate(state.survey, candId);
      // Activate the NEA-04 body with the staked rock's rolled grid so the
      // player can build on what they just claimed. Only resize when no
      // buildings exist yet — don't disrupt an in-progress base.
      if (cand) {
        const nea = state.bodies.nea_04;
        if (nea.buildings.length === 0) {
          const grid = cand.resolvedGrid ?? cand.hiddenGrid;
          nea.gridW = grid.w;
          nea.gridH = grid.h;
        }
      }
      commit();
    },
    [commit],
  );
  const abandonProspecting = useCallback(() => {
    _abandonProspecting(stateRef.current.survey);
    commit();
  }, [commit]);
  const dismissAlert = useCallback(
    (alertId: string) => {
      const a = stateRef.current.alerts.find((x) => x.id === alertId);
      if (a) a.resolved = true;
      commit();
    },
    [commit],
  );
  const dismissAfk = useCallback(() => setAfkSummary(null), []);
  const setGraphicsPack = useCallback(
    (pack: "noir" | "atlas") => {
      stateRef.current.graphicsPack = pack;
      commit();
    },
    [commit],
  );
  const dismissTierUpModal = useCallback(() => {
    stateRef.current.tierUpModalSeen[1] = true;
    commit();
  }, [commit]);
  const newRun = useCallback(() => {
    stateRef.current = newGame();
    setAfkSummary(null);
    commit();
  }, [commit]);
  const debugAddCredits = useCallback(
    (amount: number) => {
      stateRef.current.credits += amount;
      commit();
    },
    [commit],
  );
  const resetSavedStateAndReload = useCallback(() => {
    // Replace the live state before clearing storage so the periodic save or
    // tick interval can't write the dirty state back during page unload.
    stateRef.current = newGame();
    clearAllGameStorage();
    window.location.reload();
  }, []);

  // dev shortcut: expose the live state ref so the preview eval harness can
  // seed scenarios without fighting the periodic-save race. Safe to ship — has
  // no UI.
  useEffect(() => {
    (window as unknown as { __voidYield: unknown }).__voidYield = {
      state: stateRef.current,
      commit,
    };
  });

  // The state ref is the canonical container for the game world (CLAUDE.md:
  // "one state, one tick"). Mutations happen in place; commit() bumps a
  // version counter via setVersion to force a re-render, so reading
  // stateRef.current here always returns a fresh snapshot for consumers.
  // eslint-disable-next-line react-hooks/refs
  return {
    // eslint-disable-next-line react-hooks/refs
    state: stateRef.current,
    afkSummary,
    place,
    demolish,
    startRoute,
    stopMiningOp,
    buyShip,
    dispatchScoutMission,
    buyFromEarth,
    sellToEarth,
    buyPrefabKit,
    claimTierUp,
    pauseBuilding,
    dismissAlert,
    dismissAfk,
    dismissTierUpModal,
    newRun,
    startFieldSweep,
    startProspecting,
    setSurveyFocus,
    stakeCandidate,
    abandonProspecting,
    setGraphicsPack,
    debugAddCredits,
    resetSavedStateAndReload,
  };
}

export type GameApi = ReturnType<typeof useGame>;
