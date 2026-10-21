import { describe, it, expect, beforeEach } from 'vitest';
import { startSession, extendSession, endSession } from '../sessionService';
import { backendDataStore } from '../dataStore';

describe('Session Service - Operations & Extension Conflict Checks', () => {
  const tableId = 'table-1';
  const actor = { id: 'usr-staff-1', name: 'John Cue', role: 'staff' };

  beforeEach(() => {
    backendDataStore.sessions = backendDataStore.sessions.filter(s => s.table_id !== tableId);
    backendDataStore.bookings = backendDataStore.bookings.filter(b => b.table_id !== tableId);
    // Ensure table status is reset
    const table = backendDataStore.tables.find(t => t.id === tableId);
    if (table) table.status = 'free';
  });

  it('starts a walk-in playing session with server-authoritative timestamp', () => {
    const res = startSession({
      tableId,
      isWalkIn: true,
      actor
    });

    expect(res.success).toBe(true);
    expect(res.session).toBeDefined();
    expect(res.session?.started_at).toBeDefined();
    expect(res.session?.table_id).toBe(tableId);
  });

  it('prevents extending a session if extension collides with a future confirmed reservation', () => {
    // 1. Start an active session
    const sessionRes = startSession({
      tableId,
      isWalkIn: true,
      actor
    });
    expect(sessionRes.success).toBe(true);
    const session = sessionRes.session!;

    // 2. Set up a future confirmed booking on table-1 in 30 minutes
    const now = Date.now();
    const futureBookingStart = new Date(now + 30 * 60000).toISOString();
    const futureBookingEnd = new Date(now + 90 * 60000).toISOString();

    // Add confirmed booking directly into store for this upcoming window
    backendDataStore.bookings.push({
      id: 'bk-future-test',
      booking_code: 'CN-FUTURE',
      table_id: tableId,
      guest_name: 'Upcoming Reserved Customer',
      guest_phone: '+91 99999 00000',
      during: `["${futureBookingStart}","${futureBookingEnd}"]`,
      status: 'confirmed',
      source: 'online',
      pin_hash: 'mockhash',
      pin_attempts: 0,
      amount: 413,
      created_at: new Date().toISOString()
    });

    // 3. Attempt to extend current session by 60 minutes
    // Current total duration will project past the future booking start time
    const extendRes = extendSession(session.id, 60, actor);

    expect(extendRes.success).toBe(false);
    expect(extendRes.error).toMatch(/reservation|upcoming/i);
  });

  it('allows extending session when no upcoming booking conflicts', () => {
    const sessionRes = startSession({
      tableId,
      isWalkIn: true,
      actor
    });
    expect(sessionRes.success).toBe(true);

    const extendRes = extendSession(sessionRes.session!.id, 30, actor);
    expect(extendRes.success).toBe(true);
    expect(extendRes.session?.extra_minutes).toBe(30);
  });

  it('ends a session and computes authoritative bill with server duration', () => {
    const sessionRes = startSession({
      tableId,
      isWalkIn: true,
      actor
    });
    const sessionId = sessionRes.session!.id;

    const endRes = endSession(sessionId, actor);
    expect(endRes.success).toBe(true);
    expect(endRes.bill).toBeDefined();
    expect(endRes.session?.ended_at).toBeDefined();
    expect(endRes.bill?.total).toBeGreaterThanOrEqual(0);
  });
});
