import { clientFetcher } from "./client-fetcher";

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  pricePaise: number;
  imageEmoji?: string | null;
  available: boolean;
  station: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  station: string;
  items: MenuItem[];
}

export interface PosContextResponse {
  categories: MenuCategory[];
  activeSessions: Array<{
    id: string;
    tableId: string;
    tableName: string;
    customerName: string;
  }>;
}

export interface SubmitOrderPayload {
  targetType: string;
  sessionId?: string;
  tableId?: string;
  customerId?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    unitPricePaise: number;
    quantity: number;
    notes?: string;
    assignedToCustomerId?: string | null;
  }>;
}

export const posApi = {
  getPosContext: () => clientFetcher<PosContextResponse>("/api/admin/pos"),

  submitOrder: (payload: SubmitOrderPayload) =>
    clientFetcher<{ success: boolean; orderId: string; orderNumber: string }>("/api/admin/pos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
