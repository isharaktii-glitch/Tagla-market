export function generateOrderCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-ORD-${ts}-${rand}`;
}

export function generateListingCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-LST-${ts}-${rand}`;
}
