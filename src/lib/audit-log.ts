export interface AuditEntry {
  actor_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const auditLog: AuditEntry[] = [];

export function logAction(entry: Omit<AuditEntry, "timestamp">) {
  const full: AuditEntry = { ...entry, timestamp: new Date().toISOString() };
  auditLog.push(full);
  if (import.meta.env.DEV) {
    console.info("[AuditLog]", full.action_type, full.entity_type, full.entity_id, full.metadata);
  }
}

export function getAuditLog(): AuditEntry[] {
  return [...auditLog];
}
