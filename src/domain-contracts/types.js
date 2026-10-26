/**
 * MatbakhLink Domain Contracts & Data Models
 * Single Source of Truth for Entity Schemas
 * Zero emojis — Strict Type Definitions
 */

/**
 * @typedef {Object} PortionOption
 * @property {string} id
 * @property {string} label
 * @property {number} priceDelta - Price change in EGP
 * @property {number} [caloriesDelta]
 */

/**
 * @typedef {Object} ExtraOption
 * @property {string} id
 * @property {string} label
 * @property {number} price - Extra cost in EGP
 * @property {number} [calories]
 */

/**
 * @typedef {Object} MenuItem
 * @property {number} id
 * @property {string} name
 * @property {string} category - 'mains' | 'appetizers' | 'beverages' | 'desserts'
 * @property {number} price - Base price in EGP
 * @property {number} calories - Base calorie count
 * @property {string} prepTime - e.g. '12m'
 * @property {string} desc - Composition description
 * @property {string} img - Photographic asset URL
 * @property {string[]} tags - e.g. ['Signature', 'High Protein']
 * @property {PortionOption[]} [portions]
 * @property {ExtraOption[]} [extras]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} cartId - Unique runtime cart item ID
 * @property {number} id - Base dish ID
 * @property {string} name - Dish title
 * @property {number} unitPrice - Adjusted item unit price in EGP
 * @property {number} calories - Adjusted calories per unit
 * @property {number} quantity - Quantity ordered
 * @property {string} [portionLabel]
 * @property {string[]} [extras] - Selected add-on labels
 * @property {string} [specialNotes] - Kitchen notes
 */

/**
 * @typedef {'new' | 'cooking' | 'preparing' | 'ready' | 'served' | 'settled'} OrderStatus
 */

/**
 * @typedef {'unpaid' | 'paid' | 'settled'} PaymentStatus
 */

/**
 * @typedef {Object} OrderTicket
 * @property {string|number} id - Ticket identifier (e.g. 'ORD-108' or 104)
 * @property {string} table_number - Assigned table code (e.g. 'T-04')
 * @property {string} [customer_name] - Guest name or party title
 * @property {CartItem[]|Object[]} [order_payload] - Snapshot of dishes with modifiers
 * @property {string} [items_summary] - Plain text summary of dishes
 * @property {number} [subtotal] - Subtotal in EGP
 * @property {number} [tax_amount] - 14% Egyptian VAT in EGP
 * @property {number} total_amount - Final grand total in EGP
 * @property {OrderStatus} status - Current progression lifecycle status
 * @property {PaymentStatus} [payment_status] - Current bill settlement status
 * @property {boolean} [is_paid] - True if digital payment or cashier payment cleared
 * @property {string} created_at - ISO timestamp
 * @property {string} [settled_at] - ISO timestamp when table was paid/settled
 * @property {string} [served_at] - ISO timestamp when dishes were delivered
 * @property {number} [elapsedSeconds] - Monotonic elapsed timer
 */

/**
 * @typedef {Object} FiscalTaxInvoice
 * @property {string} invoiceNumber - e.g. 'ETA-INV-2026-90421'
 * @property {string} taxRegistrationNumber - Egyptian Tax Authority ID: 'TR-892-411-902'
 * @property {string} commercialRegistration - 'CR-104920'
 * @property {string} legalEntityName - 'MatbakhLink Gourmet Flame Grill S.A.E.'
 * @property {string} fiscalUuid - ETA cryptographic UUID
 * @property {number} subtotalNet - Net amount before tax in EGP
 * @property {number} vatAmount - 14% Egyptian VAT in EGP
 * @property {number} grandTotal - Final total in EGP
 * @property {string} settlementMethod - 'APPLE_PAY' | 'CARD' | 'INSTAPAY' | 'CASHIER_COUNTER'
 * @property {Date} settledAt - Timestamp of settlement
 */

/**
 * @typedef {Object} TablePaymentSession
 * @property {string} orderId - Ticket ID
 * @property {string} tableNumber - e.g. '04'
 * @property {CartItem[]} items - Order contents
 * @property {number} subtotal - Net amount in EGP
 * @property {number} vat - 14% VAT in EGP
 * @property {number} total - Grand total in EGP
 * @property {number} splitCount - Number of diners splitting bill
 * @property {'table_pay' | 'exit_cashier'} activeMode - Current workflow mode
 * @property {string} exitPassId - e.g. 'EXIT-T04-8921'
 */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}
