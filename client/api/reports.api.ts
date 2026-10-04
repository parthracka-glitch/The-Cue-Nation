import { clientFetcher } from "./client-fetcher";

export interface AnalyticsResponse {
  totalRevenuePaise: number;
  totalBillsCount: number;
  avgTicketPaise: number;
  revenueSplit: Array<{ name: string; value: number; fill: string }>;
  paymentBreakdown: Array<{ name: string; value: number }>;
  tableUtilization: Array<{ type: string; hours: number }>;
}

export interface DayCloseSummaryResponse {
  date: string;
  openingCashPaise: number;
  cashCollected: number;
  upiCollected: number;
  cardCollected: number;
  creditGiven: number;
  expectedCashInDrawer: number;
  pastCloses: any[];
}

export const reportsApi = {
  getAnalytics: (range = "7d") =>
    clientFetcher<AnalyticsResponse>(`/api/admin/reports?range=${range}`),

  getDayCloseSummary: () =>
    clientFetcher<DayCloseSummaryResponse>("/api/admin/reports/day-close"),

  submitDayClose: (actualCashPaise: number, notes?: string) =>
    clientFetcher("/api/admin/reports/day-close", {
      method: "POST",
      body: JSON.stringify({ actualCashPaise, notes }),
    }),
};
