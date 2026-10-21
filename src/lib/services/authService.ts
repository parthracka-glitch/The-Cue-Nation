import { backendDataStore } from "./dataStore";
import { verifyPassword, createSessionToken, verifySessionToken } from "./crypto";
import { logAuditEvent } from "./auditService";

export interface AuthSession {
  id: string;
  role: "customer" | "staff" | "manager" | "owner" | "admin";
  name: string;
  email: string;
}

export function loginStaff(identifier: string, password: string): {
  success: boolean;
  token?: string;
  user?: AuthSession;
  error?: string;
} {
  const cleanId = identifier.trim().toLowerCase();
  const staff = backendDataStore.staffAccounts.find(
    (s) => s.staff_id.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
  );

  if (!staff) {
    return { success: false, error: "Invalid staff credentials" };
  }

  if (!staff.active) {
    logAuditEvent({
      actorId: staff.id,
      actorName: staff.name,
      actorRole: staff.role,
      action: "STAFF_LOGIN_BLOCKED_INACTIVE",
      resourceType: "auth",
      resourceId: staff.id,
      details: { staffId: staff.staff_id },
    });
    return { success: false, error: "This staff account has been deactivated. Contact the administrator." };
  }

  const isValid = verifyPassword(password, staff.password_hash);
  if (!isValid) {
    return { success: false, error: "Invalid staff credentials" };
  }

  staff.last_login_at = new Date().toISOString();

  const userSession: AuthSession = {
    id: staff.id,
    role: staff.role,
    name: staff.name,
    email: staff.email,
  };

  const token = createSessionToken(userSession);

  logAuditEvent({
    actorId: staff.id,
    actorName: staff.name,
    actorRole: staff.role,
    action: "STAFF_LOGIN_SUCCESS",
    resourceType: "auth",
    resourceId: staff.id,
    details: { staffId: staff.staff_id },
  });

  return {
    success: true,
    token,
    user: userSession,
  };
}

export function loginAdmin(email: string, password: string): {
  success: boolean;
  token?: string;
  user?: AuthSession;
  error?: string;
} {
  const cleanEmail = email.trim().toLowerCase();
  const admin = backendDataStore.adminAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!admin) {
    return { success: false, error: "Invalid administrator credentials" };
  }

  if (!admin.active) {
    return { success: false, error: "This admin account is suspended" };
  }

  const isValid = verifyPassword(password, admin.password_hash);
  if (!isValid) {
    return { success: false, error: "Invalid administrator credentials" };
  }

  admin.last_login_at = new Date().toISOString();

  const userSession: AuthSession = {
    id: admin.id,
    role: admin.role,
    name: admin.name,
    email: admin.email,
  };

  const token = createSessionToken(userSession);

  logAuditEvent({
    actorId: admin.id,
    actorName: admin.name,
    actorRole: admin.role,
    action: "ADMIN_LOGIN_SUCCESS",
    resourceType: "auth",
    resourceId: admin.id,
    details: { adminId: admin.admin_id },
  });

  return {
    success: true,
    token,
    user: userSession,
  };
}

export function authenticateRequest(authHeaderOrCookie?: string | null): AuthSession | null {
  if (!authHeaderOrCookie) return null;
  const token = authHeaderOrCookie.startsWith("Bearer ")
    ? authHeaderOrCookie.slice(7)
    : authHeaderOrCookie;

  const session = verifySessionToken(token);
  if (!session) return null;

  return session as AuthSession;
}
