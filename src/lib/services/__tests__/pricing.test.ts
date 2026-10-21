import { describe, it, expect } from 'vitest';
import { calculateAuthoritativePrice } from '../pricingService';

describe('Pricing Service - Authoritative Calculations', () => {
  it('correctly calculates daytime pool rate with configured tax', () => {
    // 60 minutes of pool on a weekday morning (table-1 is Pool Table)
    const quote = calculateAuthoritativePrice(
      'table-1',
      '2026-11-04T11:00:00.000Z',
      '2026-11-04T12:00:00.000Z'
    );

    expect(quote.tableType).toBe('pool');
    expect(quote.durationMinutes).toBe(60);
    expect(quote.ratePerHour).toBe(300);
    expect(quote.baseCharge).toBe(300);
    expect(quote.taxPercentage).toBe(5);
    expect(quote.taxAmount).toBe(15); // 300 * 0.05 = 15
    expect(quote.totalAmount).toBe(315);
  });

  it('correctly calculates 90 minute duration proportionally', () => {
    // 90 minutes on table-1 (Pool Table) during prime slot (19:30 local)
    const quote = calculateAuthoritativePrice(
      'table-1',
      '2026-11-04T14:00:00.000Z',
      '2026-11-04T15:30:00.000Z'
    );

    expect(quote.durationMinutes).toBe(90);
    // Base = 1.5 * 350 (prime hour rate) = 525
    expect(quote.baseCharge).toBe(525);
    // Tax = 525 * 0.05 = 26.25 -> 26 rounded
    expect(quote.taxAmount).toBe(26);
    expect(quote.totalAmount).toBe(551);
  });

  it('correctly applies snooker premium base rate', () => {
    // table-5 is Riley Aristocrat Snooker (500/hr)
    const quote = calculateAuthoritativePrice(
      'table-5',
      '2026-11-04T11:00:00.000Z',
      '2026-11-04T12:00:00.000Z'
    );

    expect(quote.tableType).toBe('snooker');
    expect(quote.ratePerHour).toBe(500);
    expect(quote.baseCharge).toBe(500);
    expect(quote.taxAmount).toBe(25); // 500 * 0.05
    expect(quote.totalAmount).toBe(525);
  });
});
