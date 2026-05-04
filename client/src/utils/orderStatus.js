export function orderStatusBadgeVariant(status) {
  switch (status) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    default:
      return "secondary";
  }
}

export const ORDER_STEPS = ["pending", "confirmed", "shipped", "delivered"];

export function stepIndex(status) {
  const i = ORDER_STEPS.indexOf(status);
  return i < 0 ? 0 : i;
}
