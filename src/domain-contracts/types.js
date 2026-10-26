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
 * @typedef {'new' | 'preparing' | 'ready' | 'served'} OrderStatus
 */

/**
 * @typedef {Object} OrderTicket
 * @property {string} id - Ticket identifier (e.g. 'ORD-108')
 * @property {string} table_number - Assigned table code (e.g. '04')
 * @property {CartItem[]} items - List of items
 * @property {number} subtotal - Subtotal in EGP
 * @property {number} vat - 14% VAT in EGP
 * @property {number} total - Final grand total in EGP
 * @property {OrderStatus} status - Current progression lifecycle status
 * @property {string} created_at - ISO timestamp
 * @property {number} [elapsedSeconds] - Monotonic elapsed timer
 */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}
