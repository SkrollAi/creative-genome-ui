const ACCOUNT_STATUS_LABELS: Record<number, string> = {
  1: "Active",
  2: "Disabled",
  3: "Unsettled",
  7: "Pending risk review",
  8: "Pending settlement",
  9: "In grace period",
  100: "Pending closure",
  101: "Closed",
};

export function getAccountStatusLabel(status: number | null): string {
  if (status == null) return "Unknown";
  return ACCOUNT_STATUS_LABELS[status] ?? "Unknown";
}

export function getAccountStatusTextClass(status: number | null): string {
  if (status === 1) return "text-emerald-600";
  if (status === 2 || status === 101) return "text-destructive";
  return "text-amber-600";
}
