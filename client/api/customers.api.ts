import { clientFetcher } from "./client-fetcher";

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  walletBalance: number;
  creditBalance: number;
  creditLimit: number;
  loyaltyPoints: number;
  lifetimeSpendPaise: number;
  visitsCount: number;
  lastVisit: string;
  activeMembership?: string | null;
  creditUtilization: number;
  isCreditRisk: boolean;
}

export const customersApi = {
  getCustomers: (filter?: string, search?: string) => {
    const params = new URLSearchParams();
    if (filter) params.append("filter", filter);
    if (search) params.append("search", search);
    return clientFetcher<{ customers: CustomerSummary[] }>(
      `/api/admin/customers?${params.toString()}`
    );
  },

  getCustomerById: (id: string) => clientFetcher<any>(`/api/admin/customers/${id}/ledger`),

  createCustomer: (data: { name: string; phone: string; email?: string; notes?: string }) =>
    clientFetcher("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  topUpWallet: (customerId: string, amountPaise: number, method = "UPI") =>
    clientFetcher(`/api/admin/customers/${customerId}/ledger`, {
      method: "POST",
      body: JSON.stringify({ action: "WALLET_TOPUP", amountPaise, method }),
    }),

  recordRepayment: (
    customerId: string,
    amountPaise: number,
    method = "UPI",
    note?: string
  ) =>
    clientFetcher(`/api/admin/customers/${customerId}/ledger`, {
      method: "POST",
      body: JSON.stringify({ action: "REPAYMENT", amountPaise, method, note }),
    }),

  sendReminder: (customerId: string) =>
    clientFetcher(`/api/admin/customers/${customerId}/ledger`, {
      method: "POST",
      body: JSON.stringify({ action: "SEND_REMINDER" }),
    }),
};
