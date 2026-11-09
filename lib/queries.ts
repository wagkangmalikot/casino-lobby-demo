"use client";

// React Query hooks. Components call these instead of calling the API directly,
// so caching, loading states and refetching are handled in one place.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deposit, fetchGames, fetchProviders, fetchWallet, spin } from "./api";
import type { DepositRequest, GameFilters, Wallet } from "./types";

export const queryKeys = {
  games: (f: GameFilters) => ["games", f] as const,
  providers: ["providers"] as const,
  wallet: ["wallet"] as const,
};

export function useGames(filters: GameFilters) {
  return useQuery({
    queryKey: queryKeys.games(filters),
    queryFn: () => fetchGames(filters),
    // Keep showing the old grid while new results load, instead of flashing empty.
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProviders() {
  return useQuery({ queryKey: queryKeys.providers, queryFn: fetchProviders, staleTime: Infinity });
}

export function useWallet() {
  return useQuery({ queryKey: queryKeys.wallet, queryFn: fetchWallet });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: DepositRequest) => deposit(req),
    // The API returns the new wallet, so write it straight into the cache.
    onSuccess: (res) => qc.setQueryData<Wallet>(queryKeys.wallet, res.wallet),
  });
}

export function useSpin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bet: number) => spin(bet),
    onSuccess: (res) => qc.setQueryData<Wallet>(queryKeys.wallet, res.wallet),
  });
}
