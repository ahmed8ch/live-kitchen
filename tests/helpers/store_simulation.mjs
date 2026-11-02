// Domain logic and state machine simulation for FlameLink Live Kitchen tests

export const ETA_VAT_RATE = 0.14;

export function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateVat(subtotal) {
  return roundCurrency(subtotal * ETA_VAT_RATE);
}

export function calculateItemTotal(item) {
  const modTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + (m.price || 0), 0);
  const unitPrice = (item.menuItem?.basePrice || 0) + modTotal;
  return roundCurrency(unitPrice * (item.quantity || 1));
}

export function calculateOrderTotals(items) {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  );
  const vat = calculateVat(subtotal);
  const total = roundCurrency(subtotal + vat);
  return { subtotal, vat, total };
}

export function calculateCompanionShare(items, companionId) {
  const companionItems = items.filter(
    (item) => item.addedBy && item.addedBy.id === companionId
  );
  const subtotal = roundCurrency(
    companionItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  );
  const vat = calculateVat(subtotal);
  const total = roundCurrency(subtotal + vat);
  return {
    items: companionItems,
    subtotal,
    vat,
    total,
  };
}

export function calculateEqualSplit(totalAmount, dinerCount) {
  if (dinerCount <= 0) return [];
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / dinerCount);
  const remainderCents = totalCents % dinerCount;

  const shares = [];
  for (let i = 0; i < dinerCount; i++) {
    const shareCents = baseCents + (i < remainderCents ? 1 : 0);
    shares.push(roundCurrency(shareCents / 100));
  }
  return shares;
}

export function calculateTip(subtotal, tipPercent) {
  return roundCurrency(subtotal * (tipPercent / 100));
}

export function simulateVoidOrder(orders, orderId, voidReason) {
  const now = new Date().toISOString();
  return orders.map((order) => {
    if (order.id === orderId) {
      return {
        ...order,
        status: 'voided',
        voidReason: voidReason || 'Operational cancellation',
        voidedAt: now,
      };
    }
    return order;
  });
}

export function simulateAuditLedger(orders) {
  const settledOrders = orders.filter((o) => o.paymentStatus === 'verified_paid' && o.status !== 'voided');
  const voidedOrders = orders.filter((o) => o.status === 'voided');

  let totalSales = 0;
  let cashCollected = 0;
  let cardCollected = 0;
  let totalVat = 0;

  for (const order of settledOrders) {
    totalSales += order.total || 0;
    totalVat += order.vat || 0;
    if (order.paymentMethod === 'cash') {
      cashCollected += order.total || 0;
    } else {
      cardCollected += order.total || 0;
    }
  }

  const voidedValue = voidedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    totalSales: roundCurrency(totalSales),
    cashCollected: roundCurrency(cashCollected),
    cardCollected: roundCurrency(cardCollected),
    totalVat: roundCurrency(totalVat),
    settledCount: settledOrders.length,
    voidedCount: voidedOrders.length,
    voidedValue: roundCurrency(voidedValue),
  };
}

export function formatStopwatch(elapsedSeconds) {
  const safeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isRush = safeSeconds > 600;
  return { timeString, isRush, elapsedSeconds: safeSeconds };
}

export function validatePin(storedPin, enteredPin) {
  if (!enteredPin || typeof enteredPin !== 'string') return false;
  const cleanEntered = enteredPin.trim();
  if (cleanEntered.length !== 4 || !/^\d{4}$/.test(cleanEntered)) return false;
  return cleanEntered === storedPin;
}
