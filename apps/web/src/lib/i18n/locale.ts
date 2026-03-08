export type I18nLocale = "en" | "pt-BR" | "es";
export type I18nRegion = "US" | "BR" | "EU" | "LATAM" | "GLOBAL";
export type I18nFiatCurrency = "USD" | "BRL" | "EUR";

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

const LATAM_COUNTRIES = new Set([
  "AR",
  "MX",
  "CO",
  "CL",
  "PE",
  "UY",
  "PY",
  "BO",
  "EC",
  "VE",
  "GT",
  "HN",
  "SV",
  "NI",
  "CR",
  "PA",
  "DO",
]);

export function localeFromRegion(region: I18nRegion): I18nLocale {
  if (region === "BR") return "pt-BR";
  if (region === "LATAM") return "es";
  return "en";
}

export function regionFromCountryCode(countryCode: string | null | undefined): I18nRegion {
  const code = (countryCode ?? "").trim().toUpperCase();
  if (!code) return "GLOBAL";
  if (code === "BR") return "BR";
  if (code === "US") return "US";
  if (EU_COUNTRIES.has(code)) return "EU";
  if (LATAM_COUNTRIES.has(code)) return "LATAM";
  return "GLOBAL";
}

export function isLocale(value: string | null | undefined): value is I18nLocale {
  return value === "en" || value === "pt-BR" || value === "es";
}

export function isRegion(value: string | null | undefined): value is I18nRegion {
  return value === "US" || value === "BR" || value === "EU" || value === "LATAM" || value === "GLOBAL";
}

export function regionFromGeoCoordinates(latRaw: number | null | undefined, lngRaw: number | null | undefined): I18nRegion {
  if (typeof latRaw !== "number" || typeof lngRaw !== "number") return "GLOBAL";
  const lat = Number.isFinite(latRaw) ? latRaw : null;
  const lng = Number.isFinite(lngRaw) ? lngRaw : null;
  if (lat === null || lng === null) return "GLOBAL";

  if (lat >= -34 && lat <= 6 && lng >= -74 && lng <= -28) return "BR";
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return "US";
  if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) return "EU";
  if (lat >= -56 && lat <= 33 && lng >= -118 && lng <= -34) return "LATAM";
  return "GLOBAL";
}

export function fiatFromRegion(region: I18nRegion): I18nFiatCurrency {
  if (region === "BR") return "BRL";
  if (region === "EU") return "EUR";
  return "USD";
}
