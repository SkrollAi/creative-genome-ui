import getSymbolFromCurrency from "currency-symbol-map";

export function currencySymbol(currency: string): string {
  return getSymbolFromCurrency(currency?.toUpperCase()) ?? currency ?? "$";
}
