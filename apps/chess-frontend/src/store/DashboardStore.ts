import { create } from "zustand";
import type { UserStats, GameHistoryItem } from "@repo/types";

interface DashboardState {
  stats: UserStats | null;
  recentGames: GameHistoryItem[];
  loadingHistory: boolean;
  lastFetched: number | null;
  
  fetchDashboardData: (force?: boolean) => Promise<void>;
  clearDashboardData: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  recentGames: [],
  loadingHistory: false,
  lastFetched: null,

  fetchDashboardData: async (force = false) => {
    const { lastFetched, stats, recentGames } = get();
    
    // Only fetch if forced or if data is missing or if older than 5 minutes
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (
      !force && 
      stats && 
      recentGames.length >= 0 && 
      lastFetched && 
      (now - lastFetched < CACHE_DURATION)
    ) {
      return; // Use cached data
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      set({ loadingHistory: true });
      const baseUrl = import.meta.env.VITE_API_URL;

      const [profileRes, gamesRes] = await Promise.all([
        fetch(`${baseUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${baseUrl}/games`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      let newStats = null;
      let newRecentGames: GameHistoryItem[] = [];

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.data?.stats) {
          newStats = profileData.data.stats;
        }
      }

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        if (gamesData.games) {
          newRecentGames = gamesData.games;
        }
      }

      set({
        stats: newStats,
        recentGames: newRecentGames,
        loadingHistory: false,
        lastFetched: now
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      set({ loadingHistory: false });
    }
  },

  clearDashboardData: () => {
    set({
      stats: null,
      recentGames: [],
      loadingHistory: false,
      lastFetched: null
    });
  }
}));
