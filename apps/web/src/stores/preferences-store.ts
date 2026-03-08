import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";
import { I18nFiatCurrency, I18nLocale, I18nRegion, fiatFromRegion as fiatFromI18nRegion, localeFromRegion } from "@/lib/i18n/locale";

export type AppLocale = I18nLocale;
export type AppRegion = I18nRegion;
export type FiatCurrency = I18nFiatCurrency;

type PreferencesState = {
  locale: AppLocale;
  region: AppRegion;
  localeManuallySet: boolean;
  regionManuallySet: boolean;
  geoResolved: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: AppLocale) => void;
  setRegion: (region: AppRegion) => void;
  applyGeoDefaults: (input: { locale: AppLocale; region: AppRegion }) => void;
};

const STORAGE_KEY = "Mix-preferences";

function detectFromBrowser(): { region: AppRegion; locale: AppLocale } {
  if (typeof navigator === "undefined") return { region: "US", locale: "en" };
  const value = (navigator.language || "en-US").toLowerCase();
  if (value.startsWith("pt")) return { region: "BR", locale: "pt-BR" };
  if (value.startsWith("es")) return { region: "LATAM", locale: "es" };
  return { region: "US", locale: "en" };
}

export function fiatFromRegion(region: AppRegion): FiatCurrency {
  return fiatFromI18nRegion(region);
}

type PersistedPreferences = {
  locale: AppLocale;
  region: AppRegion;
  localeManuallySet?: boolean;
  regionManuallySet?: boolean;
  geoResolved?: boolean;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  locale: "en",
  region: "US",
  localeManuallySet: false,
  regionManuallySet: false,
  geoResolved: false,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const fallback = detectFromBrowser();
    const persisted = readJson<PersistedPreferences>(STORAGE_KEY, fallback);
    set({
      locale: persisted.locale,
      region: persisted.region,
      localeManuallySet: Boolean(persisted.localeManuallySet),
      regionManuallySet: Boolean(persisted.regionManuallySet),
      geoResolved: Boolean(persisted.geoResolved),
      hydrated: true,
    });
  },
  setLocale: (locale) => {
    set({ locale, localeManuallySet: true });
    writeJson(STORAGE_KEY, {
      locale,
      region: get().region,
      localeManuallySet: true,
      regionManuallySet: get().regionManuallySet,
      geoResolved: get().geoResolved,
    });
  },
  setRegion: (region) => {
    const locale = localeFromRegion(region);
    set({ region, locale, localeManuallySet: true, regionManuallySet: true });
    writeJson(STORAGE_KEY, {
      locale,
      region,
      localeManuallySet: true,
      regionManuallySet: true,
      geoResolved: get().geoResolved,
    });
  },
  applyGeoDefaults: ({ locale, region }) => {
    if (get().localeManuallySet || get().regionManuallySet) return;
    set({ locale, region, geoResolved: true });
    writeJson(STORAGE_KEY, {
      locale,
      region,
      localeManuallySet: false,
      regionManuallySet: false,
      geoResolved: true,
    });
  },
}));
