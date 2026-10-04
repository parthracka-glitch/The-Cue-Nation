import { clientFetcher } from "./client-fetcher";

export interface KDSTicketItem {
  id: string;
  orderId: string;
  tableName: string;
  tableType: string;
  customerName: string;
  itemName: string;
  emoji: string;
  quantity: number;
  notes?: string | null;
  station: string;
  kotStatus: "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  sentAt: string;
  elapsedMinutes: number;
}

export const kitchenApi = {
  getTickets: (stationFilter?: string) =>
    clientFetcher<{ items: KDSTicketItem[] }>(
      `/api/kitchen/tickets${stationFilter ? `?station=${stationFilter}` : ""}`
    ),

  advanceItemStatus: (orderItemId: string, newStatus: string) =>
    clientFetcher("/api/kitchen/tickets", {
      method: "PATCH",
      body: JSON.stringify({ orderItemId, newStatus }),
    }),
};
