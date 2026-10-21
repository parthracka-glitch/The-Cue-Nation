import { describe, it, expect, beforeEach } from 'vitest';
import { createBooking } from '../bookingService';
import { backendDataStore } from '../dataStore';

describe('Booking Service - Concurrency & Anti-Double-Booking', () => {
  const tableId = 'table-1'; // Brunswick Gold Crown (pool)

  beforeEach(() => {
    // Reset test table bookings before each run
    backendDataStore.bookings = backendDataStore.bookings.filter(b => b.table_id !== tableId);
    const table = backendDataStore.tables.find(t => t.id === tableId);
    if (table) {
      table.status = 'free';
      table.active = true;
    }
  });

  it('allows booking when table is completely free', () => {
    const res = createBooking({
      tableId,
      guestName: 'Alice Johnson',
      guestEmail: 'alice@example.com',
      guestPhone: '+91 98765 43210',
      startISO: '2026-11-01T14:00:00.000Z',
      endISO: '2026-11-01T15:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    expect(res.success).toBe(true);
    expect(res.booking).toBeDefined();
    expect(res.booking?.table_id).toBe(tableId);
    expect(res.booking?.status).toBe('confirmed');
    expect(res.rawPin).toBeDefined();
  });

  it('strictly prevents overlapping booking for the same table at identical time', () => {
    // First booking: 14:00 - 15:00
    const first = createBooking({
      tableId,
      guestName: 'First Booker',
      guestEmail: 'first@example.com',
      guestPhone: '+91 98765 11111',
      startISO: '2026-11-01T14:00:00.000Z',
      endISO: '2026-11-01T15:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });
    expect(first.success).toBe(true);

    // Second overlapping attempt: 14:00 - 15:00
    const second = createBooking({
      tableId,
      guestName: 'Second Conflicting Booker',
      guestEmail: 'second@example.com',
      guestPhone: '+91 98765 22222',
      startISO: '2026-11-01T14:00:00.000Z',
      endISO: '2026-11-01T15:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    expect(second.success).toBe(false);
    expect(second.error).toMatch(/reserved|unavailable/i);
  });

  it('strictly prevents partial overlaps (starts before, ends during existing reservation)', () => {
    // Existing: 15:00 - 16:30
    createBooking({
      tableId,
      guestName: 'Existing Res',
      guestEmail: 'res@example.com',
      guestPhone: '+91 98765 33333',
      startISO: '2026-11-02T15:00:00.000Z',
      endISO: '2026-11-02T16:30:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    // Overlapping attempt: 14:30 - 15:30 (starts before, ends during)
    const overlapBefore = createBooking({
      tableId,
      guestName: 'Overlap Before',
      guestEmail: 'overlap@example.com',
      guestPhone: '+91 98765 44444',
      startISO: '2026-11-02T14:30:00.000Z',
      endISO: '2026-11-02T15:30:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    expect(overlapBefore.success).toBe(false);
    expect(overlapBefore.error).toMatch(/reserved|unavailable/i);
  });

  it('strictly prevents partial overlaps (starts during, ends after existing reservation)', () => {
    // Existing: 15:00 - 16:30
    createBooking({
      tableId,
      guestName: 'Existing Res',
      guestEmail: 'res@example.com',
      guestPhone: '+91 98765 33333',
      startISO: '2026-11-03T15:00:00.000Z',
      endISO: '2026-11-03T16:30:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    // Overlapping attempt: 16:00 - 17:00 (starts during, ends after)
    const overlapAfter = createBooking({
      tableId,
      guestName: 'Overlap After',
      guestEmail: 'overlap@example.com',
      guestPhone: '+91 98765 55555',
      startISO: '2026-11-03T16:00:00.000Z',
      endISO: '2026-11-03T17:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });

    expect(overlapAfter.success).toBe(false);
    expect(overlapAfter.error).toMatch(/reserved|unavailable/i);
  });

  it('allows back-to-back non-overlapping bookings on the same table', () => {
    // Booking 1: 17:00 - 18:00
    const b1 = createBooking({
      tableId,
      guestName: 'Slot One',
      guestEmail: 'slot1@example.com',
      guestPhone: '+91 98765 66666',
      startISO: '2026-11-04T17:00:00.000Z',
      endISO: '2026-11-04T18:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });
    expect(b1.success).toBe(true);

    // Booking 2: 18:00 - 19:00 (exact boundary touch)
    const b2 = createBooking({
      tableId,
      guestName: 'Slot Two',
      guestEmail: 'slot2@example.com',
      guestPhone: '+91 98765 77777',
      startISO: '2026-11-04T18:00:00.000Z',
      endISO: '2026-11-04T19:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });
    expect(b2.success).toBe(true);
  });

  it('allows simultaneous bookings on different tables', () => {
    const tableTwo = 'table-2';

    const t1 = createBooking({
      tableId,
      guestName: 'Table One Customer',
      guestEmail: 't1@example.com',
      guestPhone: '+91 98765 88888',
      startISO: '2026-11-05T19:00:00.000Z',
      endISO: '2026-11-05T20:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });
    expect(t1.success).toBe(true);

    const t2 = createBooking({
      tableId: tableTwo,
      guestName: 'Table Two Customer',
      guestEmail: 't2@example.com',
      guestPhone: '+91 98765 99999',
      startISO: '2026-11-05T19:00:00.000Z',
      endISO: '2026-11-05T20:00:00.000Z',
      paymentMethod: 'pay_at_venue'
    });
    expect(t2.success).toBe(true);
  });
});
