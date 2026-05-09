import { useCallback, useMemo } from "react";
import { levelService } from "../services/levelService";
import { xpService } from "../services/xpService";
import { useLevelStore } from "../store/levelStore";

export const useLevels = (userId) => {
  const {
    levels,
    xpLogs,
    isLoadingLevels,
    setLevels,
    setXPLogs,
    setIsLoadingLevels
  } = useLevelStore();

  const fetchLevels = useCallback(async () => {
    setIsLoadingLevels(true);
    try {
      const data = await levelService.getLevels();
      setLevels(data);
    } catch (err) {
      console.error("Failed to fetch levels:", err);
    } finally {
      setIsLoadingLevels(false);
    }
  }, []);

  const fetchXPLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const logs = await xpService.getUserXPLogs(userId);
      setXPLogs(logs);
    } catch (err) {
      console.error("Failed to fetch XP logs:", err);
    }
  }, [userId]);

  const logXP = async (payload) => {
    try {
      await xpService.logXP(payload);
      await fetchXPLogs(); // refresh logs
    } catch (err) {
      console.error("Failed to log XP:", err);
    }
  };

  const getStartingLevels = (levels) => {
    const grouped = {};

    levels.forEach((lvl) => {
      const key = lvl.classification.toLowerCase();

      if (!grouped[key] || lvl.level < grouped[key].level) {
        grouped[key] = lvl;
      }
    });

    return grouped;
  };

  const startingLevels = useMemo(() => {
    return getStartingLevels(levels);
  }, [levels]);

  return {
    levels,
    startingLevels,
    xpLogs,
    isLoadingLevels,
    fetchLevels,
    fetchXPLogs,
    logXP
  };
};