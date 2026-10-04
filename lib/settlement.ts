export interface PlayerShare {
  playerId: string;
  playerName?: string;
  sharePaise: number;
  tableSharePaise: number;
  foodSharePaise: number;
  taxSharePaise: number;
}

/**
 * Distributes total paise among n people evenly.
 * Uses modulus arithmetic to distribute remainder paise sequentially,
 * ensuring the sum of all shares equals totalPaise EXACTLY with 0 leakage.
 *
 * Example: 100 paise / 3 people -> [34, 33, 33] (sum = 100)
 */
export function splitEven(totalPaise: number, n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [totalPaise];

  const baseShare = Math.floor(totalPaise / n);
  const remainder = totalPaise % n;

  const shares: number[] = [];
  for (let i = 0; i < n; i++) {
    // Distribute 1 extra paise to the first 'remainder' people
    shares.push(baseShare + (i < remainder ? 1 : 0));
  }

  return shares;
}

export interface SplitItemInput {
  orderItems: Array<{
    id: string;
    name: string;
    unitPricePaise: number;
    quantity: number;
    assignedToCustomerId?: string | null;
    taxPercent?: number;
  }>;
  tableChargePaise: number;
  players: Array<{ id: string; name: string }>;
  tablePayerId?: string; // If specific person pays table time
  defaultTaxPercent?: number;
}

/**
 * Split folio by item assignments.
 * Table charge is assigned to tablePayerId or split evenly if unspecified.
 */
export function splitByItem({
  orderItems,
  tableChargePaise,
  players,
  tablePayerId,
  defaultTaxPercent = 5.0,
}: SplitItemInput): PlayerShare[] {
  const n = players.length;
  if (n === 0) return [];

  // 1. Table time share allocation
  const tableShares: Record<string, number> = {};
  if (tablePayerId) {
    players.forEach((p) => {
      tableShares[p.id] = p.id === tablePayerId ? tableChargePaise : 0;
    });
  } else {
    const evenTable = splitEven(tableChargePaise, n);
    players.forEach((p, idx) => {
      tableShares[p.id] = evenTable[idx] || 0;
    });
  }

  // 2. Food items allocation
  const foodShares: Record<string, number> = {};
  const taxShares: Record<string, number> = {};
  players.forEach((p) => {
    foodShares[p.id] = 0;
    taxShares[p.id] = 0;
  });

  // Calculate table tax per player
  players.forEach((p) => {
    const tableTax = Math.round((tableShares[p.id] * defaultTaxPercent) / 100);
    taxShares[p.id] += tableTax;
  });

  // Assign food items
  const unassignedItems: Array<{ subtotal: number; tax: number }> = [];

  for (const item of orderItems) {
    const subtotal = item.unitPricePaise * item.quantity;
    const taxRate = item.taxPercent !== undefined ? item.taxPercent : defaultTaxPercent;
    const tax = Math.round((subtotal * taxRate) / 100);

    if (item.assignedToCustomerId && foodShares[item.assignedToCustomerId] !== undefined) {
      foodShares[item.assignedToCustomerId] += subtotal;
      taxShares[item.assignedToCustomerId] += tax;
    } else {
      unassignedItems.push({ subtotal, tax });
    }
  }

  // Split any unassigned food items evenly
  if (unassignedItems.length > 0) {
    const totalUnassignedFood = unassignedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const totalUnassignedTax = unassignedItems.reduce((acc, i) => acc + i.tax, 0);

    const evenUnassignedFood = splitEven(totalUnassignedFood, n);
    const evenUnassignedTax = splitEven(totalUnassignedTax, n);

    players.forEach((p, idx) => {
      foodShares[p.id] += evenUnassignedFood[idx];
      taxShares[p.id] += evenUnassignedTax[idx];
    });
  }

  return players.map((p) => {
    const tablePart = tableShares[p.id];
    const foodPart = foodShares[p.id];
    const taxPart = taxShares[p.id];
    return {
      playerId: p.id,
      playerName: p.name,
      tableSharePaise: tablePart,
      foodSharePaise: foodPart,
      taxSharePaise: taxPart,
      sharePaise: tablePart + foodPart + taxPart,
    };
  });
}

export interface LoserPaysInput {
  tableChargePaise: number;
  foodItemsByPlayer: Record<
    string,
    Array<{ name: string; unitPricePaise: number; quantity: number; taxPercent?: number }>
  >;
  loserId: string;
  playerNames?: Record<string, string>;
  defaultTaxPercent?: number;
}

/**
 * Loser-Pays Settlement Model:
 * The designated loser pays 100% of the table game time (and its tax).
 * Every other player pays solely for their own food and beverage items (and their tax).
 */
export function loserPays({
  tableChargePaise,
  foodItemsByPlayer,
  loserId,
  playerNames = {},
  defaultTaxPercent = 5.0,
}: LoserPaysInput): PlayerShare[] {
  const playerIds = Object.keys(foodItemsByPlayer);
  if (!playerIds.includes(loserId)) {
    playerIds.push(loserId);
  }

  const tableTax = Math.round((tableChargePaise * defaultTaxPercent) / 100);

  return playerIds.map((playerId) => {
    const isLoser = playerId === loserId;
    const tablePart = isLoser ? tableChargePaise : 0;
    const tableTaxPart = isLoser ? tableTax : 0;

    const items = foodItemsByPlayer[playerId] || [];
    let foodSubtotal = 0;
    let foodTax = 0;

    for (const item of items) {
      const sub = item.unitPricePaise * item.quantity;
      const rate = item.taxPercent !== undefined ? item.taxPercent : defaultTaxPercent;
      foodSubtotal += sub;
      foodTax += Math.round((sub * rate) / 100);
    }

    const totalTaxForPlayer = tableTaxPart + foodTax;
    const totalShare = tablePart + foodSubtotal + totalTaxForPlayer;

    return {
      playerId,
      playerName: playerNames[playerId] || `Player ${playerId}`,
      tableSharePaise: tablePart,
      foodSharePaise: foodSubtotal,
      taxSharePaise: totalTaxForPlayer,
      sharePaise: totalShare,
    };
  });
}

export interface PaymentEntry {
  amountPaise: number;
  method: "CASH" | "UPI" | "CARD" | "WALLET" | "CREDIT" | string;
}

export interface AllocationResult {
  totalPaidPaise: number;
  remainingPaise: number;
  changeDuePaise: number;
  status: "PAID" | "PARTIAL" | "CREDIT" | "OPEN";
}

/**
 * Evaluates payment allocation against bill total
 */
export function allocatePayments(
  totalPaise: number,
  payments: PaymentEntry[]
): AllocationResult {
  const totalPaid = payments.reduce((acc, p) => acc + p.amountPaise, 0);

  const remaining = Math.max(0, totalPaise - totalPaid);
  const changeDue = totalPaid > totalPaise ? totalPaid - totalPaise : 0;

  let status: "PAID" | "PARTIAL" | "CREDIT" | "OPEN" = "OPEN";

  if (totalPaid >= totalPaise) {
    // Check if entire bill was charged to CREDIT
    const isCredit = payments.some((p) => p.method === "CREDIT" && p.amountPaise === totalPaise);
    status = isCredit ? "CREDIT" : "PAID";
  } else if (totalPaid > 0) {
    status = "PARTIAL";
  }

  return {
    totalPaidPaise: totalPaid,
    remainingPaise: remaining,
    changeDuePaise: changeDue,
    status,
  };
}
