import { describe, it, expect, beforeEach } from 'vitest';
import { venueStore } from '../../store/venueStore';
import { startSession } from '../sessionService';
import { backendDataStore } from '../dataStore';
import { createBooking } from '../bookingService';

describe('3 Pool & 3 Snooker Table Slot Availability and Auto-Allocation Flow', () => {
  const staffActor = { id: 'staff-auto-1', name: 'Auto Allocation Staff', role: 'staff' as const };

  beforeEach(() => {
    // Reset venue store and backend data store
    venueStore.resetForTesting();
    const tables = venueStore.getTables();
    expect(tables.length).toBe(6);
    expect(tables.filter(t => t.type === 'pool').length).toBe(3);
    expect(tables.filter(t => t.type === 'snooker').length).toBe(3);
  });

  it('correctly reports 3/3 tables available when no bookings exist for a slot', () => {
    const startISO = '2026-11-05T15:00:00.000Z';
    const endISO = '2026-11-05T16:00:00.000Z';

    const poolFreeCount = venueStore.getAvailableTablesCount('pool', startISO, endISO);
    expect(poolFreeCount).toBe(3);

    const snookerFreeCount = venueStore.getAvailableTablesCount('snooker', startISO, endISO);
    expect(snookerFreeCount).toBe(3);
  });

  it('generates a 6-digit PIN and allows automated table allocation upon check-in', () => {
    const startISO = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min ago
    const endISO = new Date(Date.now() + 55 * 60 * 1000).toISOString();

    // 1. Customer books a Pool table
    const bookingRes = venueStore.createBooking({
      tableId: 'pool-1',
      guestName: 'Parth Player',
      guestPhone: '+91 99999 88888',
      startISO,
      endISO,
      amount: 300,
    });

    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.pin).toBeDefined();
    expect(bookingRes.pin.length).toBe(6);

    const customerPin = bookingRes.pin;

    // 2. Staff enters the customer PIN: auto-allocates an available pool table
    const checkInRes = venueStore.checkInWithPinAutoAllocate(customerPin);
    expect(checkInRes.success).toBe(true);
    expect(checkInRes.table).toBeDefined();
    expect(checkInRes.table?.type).toBe('pool');
    expect(checkInRes.session).toBeDefined();
    expect(checkInRes.session?.started_at).toBeDefined();
    expect(checkInRes.session?.ended_at).toBeNull();

    // 3. Table status is now running
    const allocatedTable = venueStore.getTable(checkInRes.table!.id);
    expect(allocatedTable?.status).toBe('running');
  });

  it('auto-allocates distinct tables when multiple customers check in with PINs', () => {
    const startISO = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const endISO = new Date(Date.now() + 55 * 60 * 1000).toISOString();

    // Customer 1 books pool
    const b1 = venueStore.createBooking({
      tableId: 'pool-1',
      guestName: 'Guest 1',
      guestPhone: '+91 11111 11111',
      startISO,
      endISO,
      amount: 300,
    });

    // Customer 2 books pool
    const b2 = venueStore.createBooking({
      tableId: 'pool-2',
      guestName: 'Guest 2',
      guestPhone: '+91 22222 22222',
      startISO,
      endISO,
      amount: 300,
    });

    const checkIn1 = venueStore.checkInWithPinAutoAllocate(b1.pin);
    const checkIn2 = venueStore.checkInWithPinAutoAllocate(b2.pin);

    expect(checkIn1.success).toBe(true);
    expect(checkIn2.success).toBe(true);
    // They should receive different pool tables
    expect(checkIn1.table?.id).not.toBe(checkIn2.table?.id);
    expect(checkIn1.table?.type).toBe('pool');
    expect(checkIn2.table?.type).toBe('pool');
  });

  it('backend sessionService auto-allocates table from booking PIN when tableId is omitted', () => {
    const startISO = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const endISO = new Date(Date.now() + 55 * 60 * 1000).toISOString();

    const bookRes = createBooking({
      tableId: 'snooker-1',
      guestName: 'Snooker Master',
      guestPhone: '+91 33333 33333',
      startISO,
      endISO,
      paymentMethod: 'pay_at_venue'
    });

    expect(bookRes.success).toBe(true);
    const pin = bookRes.rawPin!;

    // Start session using PIN without explicitly specifying tableId
    const sessionRes = startSession({
      pin,
      actor: staffActor
    });

    expect(sessionRes.success).toBe(true);
    expect(sessionRes.session).toBeDefined();
    expect(sessionRes.session?.table_id).toMatch(/snooker-\d/);
  });
});
