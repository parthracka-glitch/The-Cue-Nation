import { backendDataStore } from "./dataStore";
import { AuditLog } from "@/types/database";

export function logAuditEvent(params: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
}): AuditLog {
  const auditLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor_id: params.actorId,
    actor_name: params.actorName,
    actor_role: params.actorRole,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    details: params.details,
  };

  backendDataStore.auditLogs.unshift(auditLog);
  return auditLog;
}

export function getAuditLogs(filters?: {
  action?: string;
  actorRole?: string;
  resourceType?: string;
  limit?: number;
}): AuditLog[] {
  let logs = [...backendDataStore.auditLogs];

  if (filters?.action) {
    logs = logs.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
  }
  if (filters?.actorRole) {
    logs = logs.filter((l) => l.actor_role === filters.actorRole);
  }
  if (filters?.resourceType) {
    logs = logs.filter((l) => l.resource_type === filters.resourceType);
  }
  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}
