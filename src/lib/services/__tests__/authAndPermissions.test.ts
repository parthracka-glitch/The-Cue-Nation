import { describe, it, expect } from 'vitest';
import { loginAdmin, loginStaff, authenticateRequest } from '../authService';
import { backendDataStore } from '../dataStore';

describe('Auth Service - Admin & Staff Authentication & Security', () => {
  it('authenticates admin with valid credentials', () => {
    const res = loginAdmin('admin@cuenation.club', 'AdminPassword123!');

    expect(res.success).toBe(true);
    expect(res.token).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user?.role).toBe('owner');
    expect(res.user?.email).toBe('admin@cuenation.club');
    // Ensure password hash is NEVER exposed
    expect((res.user as unknown as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it('rejects admin with incorrect password', () => {
    const res = loginAdmin('admin@cuenation.club', 'WrongPassword!');

    expect(res.success).toBe(false);
    expect(res.token).toBeUndefined();
    expect(res.error).toMatch(/invalid.*credentials/i);
  });

  it('authenticates staff with valid staff ID and password', () => {
    const res = loginStaff('STF-101', 'StaffPassword123!');

    expect(res.success).toBe(true);
    expect(res.token).toBeDefined();
    expect(res.user).toBeDefined();
    expect((res.user as unknown as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it('rejects staff with wrong password', () => {
    const res = loginStaff('STF-101', 'BadPassword');

    expect(res.success).toBe(false);
    expect(res.token).toBeUndefined();
    expect(res.error).toMatch(/invalid.*credentials/i);
  });

  it('blocks inactive staff accounts from logging in', () => {
    // Find staff member and temporarily deactivate
    const staff = backendDataStore.staffAccounts.find(s => s.staff_id === 'STF-101');
    if (staff) staff.active = false;

    const res = loginStaff('STF-101', 'StaffPassword123!');

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/deactivated|contact/i);

    // Restore for subsequent runs
    if (staff) staff.active = true;
  });

  it('validates session tokens correctly via authenticateRequest', () => {
    const login = loginAdmin('admin@cuenation.club', 'AdminPassword123!');
    expect(login.token).toBeDefined();

    const session = authenticateRequest(`Bearer ${login.token!}`);
    expect(session).toBeDefined();
    expect(session?.role).toBe('owner');
    expect(session?.email).toBe('admin@cuenation.club');
  });

  it('rejects tampered or invalid session tokens', () => {
    const verified = authenticateRequest('Bearer fake-tampered-token.12345');
    expect(verified).toBeNull();
  });
});
