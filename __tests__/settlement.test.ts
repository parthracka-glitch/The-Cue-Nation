import { describe, it, expect } from "vitest";
import {
  splitEven,
  splitByItem,
  loserPays,
  allocatePayments,
} from "../lib/settlement";

describe("Settlement Engine - Exact Splits & Remainder Distribution", () => {
  it("splits 100 paise across 3 players such that shares sum to exactly 100", () => {
    const shares = splitEven(100, 3);

    expect(shares).toEqual([34, 33, 33]);
    const sum = shares.reduce((acc, s) => acc + s, 0);
    expect(sum).toBe(100);
  });

  it("splits large odd numbers across arbitrary players with 0 paise leakage", () => {
    const total = 45893; // Rs 458.93
    const n = 7;
    const shares = splitEven(total, n);

    expect(shares.length).toBe(7);
    const sum = shares.reduce((acc, s) => acc + s, 0);
    expect(sum).toBe(total);
  });

  it("handles single player split", () => {
    expect(splitEven(5000, 1)).toEqual([5000]);
  });
});

describe("Settlement Engine - Loser-Pays Scenario", () => {
  it("executes 3-player loser-pays scenario correctly", () => {
    // Table time charge = Rs 200 (20000 paise)
    // 3 Players: Player 1 (Loser), Player 2, Player 3
    // Player 1 food: Fries (Rs 130 = 13000 paise)
    // Player 2 food: Burger (Rs 220 = 22000 paise)
    // Player 3 food: Coffee (Rs 140 = 14000 paise)
    // Tax rate: 5%

    const loserId = "player-1";
    const foodItemsByPlayer = {
      "player-1": [{ name: "Fries", unitPricePaise: 13000, quantity: 1 }],
      "player-2": [{ name: "Burger", unitPricePaise: 22000, quantity: 1 }],
      "player-3": [{ name: "Coffee", unitPricePaise: 14000, quantity: 1 }],
    };

    const shares = loserPays({
      tableChargePaise: 20000,
      foodItemsByPlayer,
      loserId,
      playerNames: {
        "player-1": "Rahul (Loser)",
        "player-2": "Aman",
        "player-3": "Pooja",
      },
      defaultTaxPercent: 5.0,
    });

    expect(shares).toHaveLength(3);

    const loser = shares.find((s) => s.playerId === "player-1")!;
    const p2 = shares.find((s) => s.playerId === "player-2")!;
    const p3 = shares.find((s) => s.playerId === "player-3")!;

    // Loser pays 100% of table time (20000) + table tax (1000) + food (13000) + food tax (650)
    expect(loser.tableSharePaise).toBe(20000);
    expect(loser.foodSharePaise).toBe(13000);
    expect(loser.taxSharePaise).toBe(1650); // 1000 + 650
    expect(loser.sharePaise).toBe(34650); // Rs 346.50

    // Non-losers pay 0 table time
    expect(p2.tableSharePaise).toBe(0);
    expect(p2.foodSharePaise).toBe(22000);
    expect(p2.taxSharePaise).toBe(1100); // 5% of 22000
    expect(p2.sharePaise).toBe(23100); // Rs 231.00

    expect(p3.tableSharePaise).toBe(0);
    expect(p3.foodSharePaise).toBe(14000);
    expect(p3.taxSharePaise).toBe(700); // 5% of 14000
    expect(p3.sharePaise).toBe(14700); // Rs 147.00

    // Total folio sanity check
    const totalFolio = shares.reduce((acc, s) => acc + s.sharePaise, 0);
    // Total subtotal = 20000 + 13000 + 22000 + 14000 = 69000
    // Total tax = 5% of 69000 = 3450
    // Total = 72450
    expect(totalFolio).toBe(72450);
  });
});

describe("Settlement Engine - Payment Allocation", () => {
  it("determines PAID, PARTIAL and CREDIT payment statuses", () => {
    // Total = Rs 500 (50000 paise)
    const partialAlloc = allocatePayments(50000, [
      { amountPaise: 20000, method: "CASH" },
    ]);
    expect(partialAlloc.status).toBe("PARTIAL");
    expect(partialAlloc.remainingPaise).toBe(30000);

    const paidAlloc = allocatePayments(50000, [
      { amountPaise: 20000, method: "CASH" },
      { amountPaise: 30000, method: "UPI" },
    ]);
    expect(paidAlloc.status).toBe("PAID");
    expect(paidAlloc.remainingPaise).toBe(0);

    const creditAlloc = allocatePayments(50000, [
      { amountPaise: 50000, method: "CREDIT" },
    ]);
    expect(creditAlloc.status).toBe("CREDIT");
    expect(creditAlloc.remainingPaise).toBe(0);
  });
});
