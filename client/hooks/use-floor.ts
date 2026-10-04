import useSWR from "swr";
import { floorApi, FloorResponse } from "../api/floor.api";

export function useFloor(refreshInterval = 5000) {
  const { data, error, isLoading, mutate } = useSWR<FloorResponse>(
    "/api/admin/floor",
    () => floorApi.getFloorState(),
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    tables: data?.tables || [],
    summary: data?.summary || {
      totalTables: 0,
      activeTables: 0,
      availableTables: 0,
      dirtyTables: 0,
      occupancyRate: 0,
      todayRevenuePaise: 0,
    },
    upcomingReservations: data?.upcomingReservations || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
