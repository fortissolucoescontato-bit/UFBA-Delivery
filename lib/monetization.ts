export type PlanType = 'free' | 'pro';

export const VENDOR_PLANS = {
  free: {
    name: 'Iniciante',
    price: 0,
    productLimit: 3,
  },
  pro: {
    name: 'Vendedor Pro',
    price: 9.90,
    productLimit: Infinity,
  }
};

export function isPro(plan: PlanType): boolean {
  return plan === 'pro';
}
