import { backendDataStore } from "./dataStore";
import { StaffAccount } from "@/types/database";
import { hashPassword } from "./crypto";
import { broadcastEvent } from "./realtimeEmitter";
import { logAuditEvent } from "./auditService";

export function getStaffAccounts(): Omit<StaffAccount, "password_hash">[] {
  return backendDataStore.staffAccounts.map(({ password_hash, ...rest }) => rest);
}

export function createStaffAccount(
  adminActor: { id: string; name: string; role: string },
  input: {
    staff_id: string;
    name: string;
    email: string;
    phone: string;
    role: "staff" | "manager";
    initialPassword: string;
  }
): { success: boolean; staff?: Omit<StaffAccount, "password_hash">; error?: string } {
  // Check duplicate staff_id or email
  const existing = backendDataStore.staffAccounts.find(
    (s) =>
      s.staff_id.toLowerCase() === input.staff_id.trim().toLowerCase() ||
      s.email.toLowerCase() === input.email.trim().toLowerCase()
  );
  if (existing) {
    return { success: false, error: "Staff with this ID or Email already exists" };
  }

  const newStaff: StaffAccount = {
    id: `staff-${Date.now()}`,
    staff_id: input.staff_id.trim().toUpperCase(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    role: input.role,
    active: true,
    password_hash: hashPassword(input.initialPassword),
    created_at: new Date().toISOString(),
  };

  backendDataStore.staffAccounts.push(newStaff);

  broadcastEvent("STAFF_UPDATED", { staffId: newStaff.id, action: "created" });
  logAuditEvent({
    actorId: adminActor.id,
    actorName: adminActor.name,
    actorRole: adminActor.role,
    action: "STAFF_ACCOUNT_CREATED",
    resourceType: "staff",
    resourceId: newStaff.id,
    details: { staffId: newStaff.staff_id, name: newStaff.name, role: newStaff.role },
  });

  const { password_hash, ...safeStaff } = newStaff;
  return { success: true, staff: safeStaff };
}

export function toggleStaffStatus(
  adminActor: { id: string; name: string; role: string },
  staffId: string,
  active: boolean
): { success: boolean; error?: string } {
  const staff = backendDataStore.staffAccounts.find((s) => s.id === staffId);
  if (!staff) return { success: false, error: "Staff account not found" };

  staff.active = active;

  broadcastEvent("STAFF_UPDATED", { staffId: staff.id, active });
  logAuditEvent({
    actorId: adminActor.id,
    actorName: adminActor.name,
    actorRole: adminActor.role,
    action: active ? "STAFF_ACCOUNT_ACTIVATED" : "STAFF_ACCOUNT_DEACTIVATED",
    resourceType: "staff",
    resourceId: staff.id,
    details: { staffId: staff.staff_id, active },
  });

  return { success: true };
}

export function resetStaffPassword(
  adminActor: { id: string; name: string; role: string },
  staffId: string,
  newPassword: string
): { success: boolean; error?: string } {
  const staff = backendDataStore.staffAccounts.find((s) => s.id === staffId);
  if (!staff) return { success: false, error: "Staff account not found" };

  staff.password_hash = hashPassword(newPassword);

  logAuditEvent({
    actorId: adminActor.id,
    actorName: adminActor.name,
    actorRole: adminActor.role,
    action: "STAFF_PASSWORD_RESET",
    resourceType: "staff",
    resourceId: staff.id,
    details: { staffId: staff.staff_id },
  });

  return { success: true };
}
