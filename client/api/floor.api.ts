import { clientFetcher } from "./client-fetcher";

export interface FloorTable {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE | OCCUPIED | PAUSED | DIRTY | MAINTENANCE
  activeSession?: {
    id: string;
    startedAt: string;
    status: string;
    billingMode: string;
    customerName: string;
    customerPhone: string | null;
    elapsedMinutes: number;
    runningTimeChargePaise: number;
    runningFoodChargePaise: number;
    totalRunningChargePaise: number;
    activeOrdersCount: number;
  } | null;
  nextReservation?: {
    id: string;
    code: string;
    guestName: string;
    startsAt: string;
    endsAt: string;
  } | null;
}

export interface FloorResponse {
  tables: FloorTable[];
  summary: {
    totalTables: number;
    activeTables: number;
    availableTables: number;
    dirtyTables: number;
    occupancyRate: number;
    todayRevenuePaise: number;
  };
  upcomingReservations: Array<{
    id: string;
    code: string;
    tableName: string;
    guestName: string;
    guestPhone: string;
    startsAt: string;
    depositPaise: number;
  }>;
}

export const floorApi = {
  getFloorState: () => clientFetcher<FloorResponse>("/api/admin/floor"),

  startSession: (data: {
    tableId: string;
    customerId?: string | null;
    walkInName?: string;
    walkInPhone?: string;
    billingMode?: string;
    packageDealId?: string | null;
    reservationId?: string | null;
  }) =>
    clientFetcher("/api/admin/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  pauseSession: (sessionId: string) =>
    clientFetcher("/api/admin/sessions", {
      method: "PATCH",
      body: JSON.stringify({ action: "PAUSE", sessionId }),
    }),

  resumeSession: (sessionId: string) =>
    clientFetcher("/api/admin/sessions", {
      method: "PATCH",
      body: JSON.stringify({ action: "RESUME", sessionId }),
    }),

  switchTable: (sessionId: string, targetTableId: string) =>
    clientFetcher("/api/admin/sessions", {
      method: "PATCH",
      body: JSON.stringify({ action: "MOVE_TABLE", sessionId, targetTableId }),
    }),

  setTableStatus: (tableId: string, statusOverride: string) =>
    clientFetcher("/api/admin/sessions", {
      method: "PATCH",
      body: JSON.stringify({ action: "SET_STATUS", tableId, statusOverride }),
    }),
};
