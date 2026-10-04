import { clientFetcher } from "./client-fetcher";

export interface AvailabilitySlot {
  hour: number;
  timeFormatted: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  isAvailable: boolean;
  estimatedTotalPaise: number;
  depositPaise: number;
  isHappyHour: boolean;
}

export interface AvailabilityResponse {
  date: string;
  tableType: string;
  totalTables: number;
  slots: AvailabilitySlot[];
}

export interface CreateBookingPayload {
  tableType: string;
  startTime: string;
  durationHours: number;
  partySize?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  notes?: string;
}

export const reservationsApi = {
  checkAvailability: (tableType: string, dateStr: string, durationHours: number) =>
    clientFetcher<AvailabilityResponse>(
      `/api/public/availability?type=${tableType}&date=${dateStr}&duration=${durationHours}`
    ),

  createBooking: (payload: CreateBookingPayload) =>
    clientFetcher<{
      reservation: any;
      tableName: string;
      depositPaise: number;
    }>("/api/public/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  lookupBooking: (code: string, phone: string) =>
    clientFetcher<any>(
      `/api/public/reservations/lookup?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`
    ),

  cancelBooking: (id: string, reason?: string) =>
    clientFetcher<{ reservation: any; message: string }>("/api/public/reservations/lookup", {
      method: "PATCH",
      body: JSON.stringify({ id, reason }),
    }),

  getGanttSchedule: (dateStr: string) =>
    clientFetcher<{ date: string; tables: any[]; reservations: any[] }>(
      `/api/admin/reservations?date=${dateStr}`
    ),

  checkInBooking: (reservationId: string, tableId?: string) =>
    clientFetcher("/api/admin/reservations", {
      method: "PATCH",
      body: JSON.stringify({ action: "CHECK_IN", id: reservationId, tableId }),
    }),
};
