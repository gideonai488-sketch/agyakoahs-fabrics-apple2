// Paystack public key — safe to embed in client code
export const PAYSTACK_PUBLIC_KEY = "pk_live_6534eeae448585db1377764e1eadda7f414117a9";

// Currency is Ghana Cedis — convert to pesewas (×100) before sending to Paystack
export function toPesewas(amountGhc: number): number {
  return Math.round(amountGhc * 100);
}
