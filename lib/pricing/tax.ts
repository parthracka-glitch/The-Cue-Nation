export interface TaxableItem {
  name: string;
  unitPricePaise: number;
  quantity: number;
  taxPercent?: number; // e.g. 5.0 for 5% GST
}

export interface TaxComputationResult {
  taxPaise: number;
  effectiveRate: number;
  itemBreakdown: Array<{
    name: string;
    subtotalPaise: number;
    taxPaise: number;
    taxPercent: number;
  }>;
}

export function computeTax(
  items: TaxableItem[],
  defaultTaxPercent = 5.0
): TaxComputationResult {
  let totalTax = 0;
  const itemBreakdown = items.map((item) => {
    const subtotal = item.unitPricePaise * item.quantity;
    const rate = item.taxPercent !== undefined ? item.taxPercent : defaultTaxPercent;
    const tax = Math.round((subtotal * rate) / 100);
    totalTax += tax;
    return {
      name: item.name,
      subtotalPaise: subtotal,
      taxPaise: tax,
      taxPercent: rate,
    };
  });

  return {
    taxPaise: totalTax,
    effectiveRate: defaultTaxPercent,
    itemBreakdown,
  };
}

export interface ComputeBillTotalsInput {
  tableChargePaise: number;
  tableTaxPercent?: number;
  orderItems?: TaxableItem[];
  discountPaise?: number;
  defaultTaxPercent?: number;
}

export interface BillTotalsResult {
  tableSubtotalPaise: number;
  cafeSubtotalPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  taxableSubtotalPaise: number;
  tableTaxPaise: number;
  cafeTaxPaise: number;
  totalTaxPaise: number;
  taxPaise: number;
  totalPaise: number;
}

export function computeBillTotals({
  tableChargePaise,
  tableTaxPercent = 5.0,
  orderItems = [],
  discountPaise = 0,
  defaultTaxPercent = 5.0,
}: ComputeBillTotalsInput): BillTotalsResult {
  // Cafe subtotal and tax
  let cafeSubtotalPaise = 0;
  let cafeTaxPaise = 0;

  for (const item of orderItems) {
    const itemSubtotal = item.unitPricePaise * item.quantity;
    const taxRate = item.taxPercent !== undefined ? item.taxPercent : defaultTaxPercent;
    const itemTax = Math.round((itemSubtotal * taxRate) / 100);

    cafeSubtotalPaise += itemSubtotal;
    cafeTaxPaise += itemTax;
  }

  const subtotalPaise = tableChargePaise + cafeSubtotalPaise;

  // Table charge after discount
  const effectiveTableBase = Math.max(0, tableChargePaise - discountPaise);
  const tableTaxPaise = Math.round((effectiveTableBase * tableTaxPercent) / 100);

  const totalTaxPaise = tableTaxPaise + cafeTaxPaise;
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + totalTaxPaise);

  return {
    tableSubtotalPaise: tableChargePaise,
    cafeSubtotalPaise,
    subtotalPaise,
    discountPaise,
    taxableSubtotalPaise: Math.max(0, subtotalPaise - discountPaise),
    tableTaxPaise,
    cafeTaxPaise,
    totalTaxPaise,
    taxPaise: totalTaxPaise,
    totalPaise,
  };
}
