import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "@/constants/currency";
import { DEFAULT_LOCALE } from "@/constants/language";

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value);
}

export function formatCurrency(value: number, currency: string = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency }).format(value);
  } catch {
    return `${DEFAULT_CURRENCY_SYMBOL}${formatNumber(value, { minimumFractionDigits: 2 })}`;
  }
}
