export interface MarginCalculation {
  costPrice: number;
  price: number;
  marketplaceFeePct: number;
  fixedFee: number;
  shippingCost: number;
  marketplaceFeeAmount: number;
  profit: number;
  marginPct: number;
}

export function calcMargin(
  price: number,
  costPrice: number,
  marketplaceFeePct: number = 0,
  fixedFee: number = 0,
  shippingCost: number = 0
): MarginCalculation {
  const p = Math.max(0, price || 0);
  const c = Math.max(0, costPrice || 0);
  const feeAmount = (p * (marketplaceFeePct || 0)) / 100;
  const profit = p - c - feeAmount - (fixedFee || 0) - (shippingCost || 0);
  const marginPct = p > 0 ? (profit / p) * 100 : 0;

  return {
    costPrice: c,
    price: p,
    marketplaceFeePct,
    fixedFee,
    shippingCost,
    marketplaceFeeAmount: feeAmount,
    profit,
    marginPct: Math.round(marginPct * 10) / 10,
  };
}
