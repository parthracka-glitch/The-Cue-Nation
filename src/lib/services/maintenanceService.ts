import { backendDataStore } from "./dataStore";
import { MaintenanceRecord } from "@/types/database";
import { broadcastEvent } from "./realtimeEmitter";
import { logAuditEvent } from "./auditService";

export function getMaintenanceRecords(): MaintenanceRecord[] {
  return [...backendDataStore.maintenanceRecords];
}

export function reportMaintenance(params: {
  tableId: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  actor: { id: string; name: string; role: string };
  markTableOffline?: boolean;
}): { success: boolean; record?: MaintenanceRecord; error?: string } {
  const table = backendDataStore.tables.find((t) => t.id === params.tableId);
  if (!table) return { success: false, error: "Table not found" };

  const record: MaintenanceRecord = {
    id: `maint-${Date.now()}`,
    table_id: table.id,
    table_name: table.name,
    issue: params.issue.trim(),
    severity: params.severity,
    status: "open",
    reported_by: `${params.actor.name} (${params.actor.id})`,
    reported_at: new Date().toISOString(),
    resolved_at: null,
    notes: null,
  };

  backendDataStore.maintenanceRecords.unshift(record);

  if (params.markTableOffline) {
    table.status = "maintenance";
    broadcastEvent("TABLE_STATUS_CHANGED", { tableId: table.id, status: "maintenance" });
  }

  broadcastEvent("MAINTENANCE_LOGGED", { record });
  logAuditEvent({
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    action: "MAINTENANCE_REPORTED",
    resourceType: "maintenance",
    resourceId: record.id,
    details: { tableId: table.id, severity: params.severity, issue: params.issue },
  });

  return { success: true, record };
}

export function resolveMaintenance(params: {
  recordId: string;
  notes: string;
  restoreTableToFree?: boolean;
  actor: { id: string; name: string; role: string };
}): { success: boolean; record?: MaintenanceRecord; error?: string } {
  const record = backendDataStore.maintenanceRecords.find((r) => r.id === params.recordId);
  if (!record) return { success: false, error: "Maintenance record not found" };

  record.status = "resolved";
  record.resolved_at = new Date().toISOString();
  record.notes = params.notes;

  if (params.restoreTableToFree) {
    const table = backendDataStore.tables.find((t) => t.id === record.table_id);
    if (table && table.status === "maintenance") {
      table.status = "free";
      broadcastEvent("TABLE_STATUS_CHANGED", { tableId: table.id, status: "free" });
    }
  }

  broadcastEvent("MAINTENANCE_LOGGED", { record });
  logAuditEvent({
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    action: "MAINTENANCE_RESOLVED",
    resourceType: "maintenance",
    resourceId: record.id,
    details: { notes: params.notes },
  });

  return { success: true, record };
}
