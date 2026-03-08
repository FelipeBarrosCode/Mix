import type { AppLocale, FiatCurrency } from "@/stores/preferences-store";

function mapLocale(locale: AppLocale) {
  if (locale === "pt-BR") return "pt-BR";
  if (locale === "es") return "es-419";
  return "en-US";
}

export function formatCurrency(value: number, currency: FiatCurrency, locale: AppLocale) {
  return new Intl.NumberFormat(mapLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTimeIso(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(mapLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
