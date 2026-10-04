import { clientFetcher } from "./client-fetcher";

export interface SessionFolioResponse {
  session: {
    id: string;
    tableId: string;
    tableName: string;
    tableType: string;
    billingMode: string;
    startedAt: string;
    endedAt: string;
    framesPlayed: number;
    status: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    walletBalance: number;
    creditBalance: number;
    creditLimit: number;
    remainingCreditLimit: number;
    membership?: string | null;
  } | null;
  timeCharge: {
    totalPaise: number;
    billableMinutes: number;
    breakdown: Array<{
      bandName: string;
      minutes: number;
      ratePaise: number;
      amountPaise: number;
      isHappyHour: boolean;
    }>;
  };
  orderItems: Array<{
    id: string;
    name: string;
    unitPricePaise: number;
    quantity: number;
    assignedToCustomerId?: string | null;
    kotStatus: string;
  }>;
  totals: {
    tableChargePaise: number;
    cafeChargePaise: number;
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    totalPaise: number;
  };
  isAlreadySettled: boolean;
}

export interface SettleBillPayload {
  splitMode?: string;
  manualDiscountPaise?: number;
  discountReason?: string;
  payments: Array<{
    customerId?: string | null;
    method: string;
    amountPaise: number;
    label?: string;
  }>;
  totals: {
    tableChargePaise: number;
    cafeChargePaise: number;
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    totalPaise: number;
  };
}

export const checkoutApi = {
  getFolio: (sessionId: string) =>
    clientFetcher<SessionFolioResponse>(`/api/admin/checkout/${sessionId}`),

  settleBill: (sessionId: string, payload: SettleBillPayload) =>
    clientFetcher<{ success: boolean; bill: any; changePaise: number }>(
      `/api/admin/checkout/${sessionId}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};
