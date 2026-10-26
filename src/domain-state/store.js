/**
 * MatbakhLink Reactive State Store
 * Domain 3: State & Stores (Cart, Active Table, Pricing Engine)
 * Zero emojis — Strict 100% Light Theme Firecrawl Compliance
 */
(function(window) {
  'use strict';

  const VAT_RATE = 0.14; // 14% Egyptian VAT
  let state = {
    currentTable: '04',
    cart: [],
    activeOrder: null
  };

  const listeners = new Set();

  function notify() {
    listeners.forEach(fn => {
      try {
        fn(state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  function getCart() {
    return state.cart;
  }

  function getCartCount() {
    return state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  function getSubtotal() {
    return state.cart.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 1)), 0);
  }

  function getVat() {
    return Math.round(getSubtotal() * VAT_RATE * 100) / 100;
  }

  function getTotal() {
    return Math.round((getSubtotal() + getVat()) * 100) / 100;
  }

  function addToCart(dish, portion, extras, notes) {
    let unitPrice = dish.price;
    let portionLabel = 'Standard';
    let addedCalories = dish.calories;

    if (portion) {
      unitPrice += (portion.priceDelta || 0);
      portionLabel = portion.label || 'Standard';
      addedCalories += (portion.caloriesDelta || 0);
    }

    const selectedExtras = (extras || []).map(ex => {
      unitPrice += (ex.price || 0);
      if (ex.calories) addedCalories += ex.calories;
      return ex.label;
    });

    const cartItem = {
      cartId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      id: dish.id,
      name: dish.name,
      unitPrice: unitPrice,
      calories: addedCalories,
      quantity: 1,
      portionLabel: portionLabel,
      extras: selectedExtras,
      specialNotes: (notes || '').trim()
    };

    state.cart.push(cartItem);
    notify();

    if (window.showToast) {
      window.showToast({
        title: 'Added to Table Order',
        message: `${dish.name} (${portionLabel}) added to Table ${state.currentTable}.`,
        meta: `${unitPrice.toFixed(2)} EGP`,
        type: 'success'
      });
    }

    return cartItem;
  }

  function updateQuantity(cartId, delta) {
    const idx = state.cart.findIndex(i => i.cartId === cartId);
    if (idx !== -1) {
      state.cart[idx].quantity += delta;
      if (state.cart[idx].quantity <= 0) {
        state.cart.splice(idx, 1);
      }
      notify();
    }
  }

  function clearCart() {
    state.cart = [];
    notify();
  }

  function setActiveOrder(order) {
    state.activeOrder = order;
    notify();
  }

  function setTable(tableNum) {
    state.currentTable = String(tableNum).padStart(2, '0');
    notify();
  }

  window.MatbakhStore = {
    getState: () => state,
    subscribe,
    getCart,
    getCartCount,
    getSubtotal,
    getVat,
    getTotal,
    addToCart,
    updateQuantity,
    clearCart,
    setActiveOrder,
    setTable
  };

})(window);
