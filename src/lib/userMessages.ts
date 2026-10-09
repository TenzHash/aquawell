/**
 * Turns technical backend errors into short, user-friendly messages.
 * Keep the original error in logs, not in the UI.
 */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "The email or password is incorrect. Please try again.";
  }
  if (message.includes("email not confirmed") || message.includes("not confirmed")) {
    return "This account has not been confirmed yet. Please contact the administrator.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with these details already exists.";
  }
  if (message.includes("duplicate")) {
    return "This information is already in use. Please check your details.";
  }
  if (message.includes("network") || message.includes("failed to fetch")) {
    return "We could not connect right now. Please check your connection and try again.";
  }
  if (message.includes("permission") || message.includes("not allowed") || message.includes("row-level security")) {
    return "You do not have permission to complete this action.";
  }
  if (message.includes("timeout")) {
    return "The request took too long. Please try again.";
  }

  return fallback;
}

export function friendlyEventTitle(type: string): string {
  const labels: Record<string, string> = {
    profile: "Profile updated",
    settings: "Station settings updated",
    sale: "Sale recorded",
    staff: "Staff update",
    assignment: "Delivery assignment",
    archive: "Order archived",
    status: "Order status updated",
    payment: "Payment updated",
    order: "New order",
    inventory: "Inventory update",
    customer: "Customer update",
  };

  return labels[type.toLowerCase()] || "Account activity";
}

export function friendlyNotificationTitle(title: string): string {
  const raw = title.trim();
  const legacyType = raw.match(/^System Event:\s*(.+)$/i)?.[1];
  if (legacyType) return friendlyEventTitle(legacyType);
  return raw || "Notification";
}

export function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function friendlyAuditAction(action: string): string {
  const text = action.trim();
  let match: RegExpMatchArray | null;

  if (/^Updated admin account profile details$/i.test(text)) {
    return "Updated the administrator profile";
  }
  if ((match = text.match(/^Updated station settings for (.+)$/i))) {
    return `Updated station settings for ${match[1]}`;
  }
  if ((match = text.match(/^Recorded sales transaction (.+?) for (.+)$/i))) {
    return `Recorded a sale for ${match[2]} (transaction ${match[1]})`;
  }
  if ((match = text.match(/^Updated staff member: (.+)$/i))) {
    return `Updated staff member: ${match[1]}`;
  }
  if ((match = text.match(/^Added new staff member: (.+)$/i))) {
    return `Added staff member: ${match[1]}`;
  }
  if ((match = text.match(/^Removed staff member ID (.+)$/i))) {
    return `Removed staff member #${match[1]}`;
  }
  if ((match = text.match(/^Assigned driver (.+?) to order (.+)$/i))) {
    return `Assigned ${match[1]} to deliver order ${match[2]}`;
  }
  if ((match = text.match(/^Archived order record (.+)$/i))) {
    return `Archived order ${match[1]}`;
  }
  if ((match = text.match(/^Order (.+?) status changed to (.+)$/i))) {
    return `Changed order ${match[1]} to ${formatStatus(match[2])}`;
  }
  if ((match = text.match(/^Updated payment status for (.+?) to (.+)$/i))) {
    return `Marked payment for order ${match[1]} as ${formatStatus(match[2])}`;
  }
  if ((match = text.match(/^Received new order (.+)$/i))) {
    return `New order received: ${match[1]}`;
  }
  if ((match = text.match(/^Low stock alert for (.+?) \((.+?) left\)$/i))) {
    return `Low stock: ${match[1]} has ${match[2]} left`;
  }
  if ((match = text.match(/^Updated inventory item: (.+)$/i))) {
    return `Updated product: ${match[1]}`;
  }
  if ((match = text.match(/^Added new product to inventory: (.+)$/i))) {
    return `Added product: ${match[1]}`;
  }
  if ((match = text.match(/^Removed inventory item ID (.+)$/i))) {
    return `Removed product #${match[1]}`;
  }
  if ((match = text.match(/^Updated customer profile: (.+)$/i))) {
    return `Updated customer profile: ${match[1]}`;
  }
  if ((match = text.match(/^Registered new customer account: (.+)$/i))) {
    return `Created customer account: ${match[1]}`;
  }
  if ((match = text.match(/^Removed customer account (.+)$/i))) {
    return `Removed customer account #${match[1]}`;
  }

  return text;
}
