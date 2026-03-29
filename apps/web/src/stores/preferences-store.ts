import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";
import { I18nFiatCurrency, I18nLocale, I18nRegion, fiatFromRegion as fiatFromI18nRegion, localeFromRegion } from "@/lib/i18n/locale";

export type AppLocale = I18nLocale;
export type AppRegion = I18nRegion;
export type FiatCurrency = I18nFiatCurrency;

type PreferencesState = {
  locale: AppLocale;
  region: AppRegion;
  fiatCurrency: FiatCurrency;
  localeManuallySet: boolean;
  regionManuallySet: boolean;
  fiatManuallySet: boolean;
  geoResolved: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: AppLocale) => void;
  setRegion: (region: AppRegion) => void;
  setFiatCurrency: (fiatCurrency: FiatCurrency) => void;
  applyGeoDefaults: (input: { locale: AppLocale; region: AppRegion }) => void;
};

const STORAGE_KEY = "Mix-preferences";

function detectFromBrowser(): { region: AppRegion; locale: AppLocale } {
  if (typeof navigator === "undefined") return { region: "US", locale: "en" };
  const value = (navigator.language || "en-US").toLowerCase();
  if (value.startsWith("pt")) return { region: "BR", locale: "pt-BR" };
  if (value.startsWith("es")) return { region: "LATAM", locale: "es" };
  if (value.startsWith("zh")) return { region: "GLOBAL", locale: "zh-CN" };
  if (value.startsWith("hi")) return { region: "GLOBAL", locale: "hi" };
  if (value.startsWith("fr")) return { region: "EU", locale: "fr" };
  if (value.startsWith("ar")) return { region: "GLOBAL", locale: "ar" };
  if (value.startsWith("bn")) return { region: "GLOBAL", locale: "bn" };
  if (value.startsWith("ru")) return { region: "GLOBAL", locale: "ru" };
  if (value.startsWith("ur")) return { region: "GLOBAL", locale: "ur" };
  return { region: "US", locale: "en" };
}

export function fiatFromRegion(region: AppRegion): FiatCurrency {
  return fiatFromI18nRegion(region);
}

type PersistedPreferences = {
  locale: AppLocale;
  region: AppRegion;
  fiatCurrency?: FiatCurrency;
  localeManuallySet?: boolean;
  regionManuallySet?: boolean;
  fiatManuallySet?: boolean;
  geoResolved?: boolean;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  locale: "en",
  region: "US",
  fiatCurrency: "USD",
  localeManuallySet: false,
  regionManuallySet: false,
  fiatManuallySet: false,
  geoResolved: false,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const fallback = detectFromBrowser();
    const persisted = readJson<PersistedPreferences>(STORAGE_KEY, fallback);
    set({
      locale: persisted.locale,
      region: persisted.region,
      fiatCurrency: persisted.fiatCurrency ?? fiatFromI18nRegion(persisted.region),
      localeManuallySet: Boolean(persisted.localeManuallySet),
      regionManuallySet: Boolean(persisted.regionManuallySet),
      fiatManuallySet: Boolean(persisted.fiatManuallySet),
      geoResolved: Boolean(persisted.geoResolved),
      hydrated: true,
    });
  },
  setLocale: (locale) => {
    set({ locale, localeManuallySet: true });
    writeJson(STORAGE_KEY, {
      locale,
      region: get().region,
      fiatCurrency: get().fiatCurrency,
      localeManuallySet: true,
      regionManuallySet: get().regionManuallySet,
      fiatManuallySet: get().fiatManuallySet,
      geoResolved: get().geoResolved,
    });
  },
  setRegion: (region) => {
    const locale = localeFromRegion(region);
    const current = get();
    const fiatCurrency = current.fiatManuallySet ? current.fiatCurrency : fiatFromI18nRegion(region);
    set({ region, locale, fiatCurrency, localeManuallySet: true, regionManuallySet: true, fiatManuallySet: current.fiatManuallySet });
    writeJson(STORAGE_KEY, {
      locale,
      region,
      fiatCurrency,
      localeManuallySet: true,
      regionManuallySet: true,
      fiatManuallySet: current.fiatManuallySet,
      geoResolved: current.geoResolved,
    });
  },
  setFiatCurrency: (fiatCurrency) => {
    set({ fiatCurrency, fiatManuallySet: true });
    writeJson(STORAGE_KEY, {
      locale: get().locale,
      region: get().region,
      fiatCurrency,
      localeManuallySet: get().localeManuallySet,
      regionManuallySet: get().regionManuallySet,
      fiatManuallySet: true,
      geoResolved: get().geoResolved,
    });
  },
  applyGeoDefaults: ({ locale, region }) => {
    if (get().localeManuallySet || get().regionManuallySet) return;
    const fiatCurrency = fiatFromI18nRegion(region);
    set({ locale, region, fiatCurrency, geoResolved: true });
    writeJson(STORAGE_KEY, {
      locale,
      region,
      fiatCurrency,
      localeManuallySet: false,
      regionManuallySet: false,
      fiatManuallySet: false,
      geoResolved: true,
    });
  },
}));
