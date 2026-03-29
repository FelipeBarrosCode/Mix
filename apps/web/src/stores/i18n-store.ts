import { create } from "zustand";
import { fallbackMessages } from "@/lib/i18n/fallback";
import { I18nLocale, I18nRegion, isLocale } from "@/lib/i18n/locale";
import { usePreferencesStore } from "@/stores/preferences-store";

type Dictionary = Record<string, string>;

const defaultHelpVideos: Partial<Record<I18nLocale, string>> = {
  en: "https://youtu.be/yZkmXeotLPI",
  es: "https://youtu.be/UoJEmFEkH-A",
  "pt-BR": "https://youtu.be/8WLNP3onJRQ",
};

type I18nState = {
  byLocale: Partial<Record<I18nLocale, Dictionary>>;
  helpVideoByLocale: Partial<Record<I18nLocale, string>>;
  loading: boolean;
  setLocaleMessages: (locale: I18nLocale, dict: Dictionary) => void;
  hydrateLocale: (locale: I18nLocale, region: I18nRegion) => Promise<void>;
  hydrateDetected: (geo?: { lat: number; lng: number }) => Promise<{ locale: I18nLocale; region: I18nRegion } | null>;
};

const inFlight = new Map<string, Promise<void>>();

export const useI18nStore = create<I18nState>((set, get) => ({
  byLocale: {
    en: fallbackMessages.en,
    "pt-BR": fallbackMessages["pt-BR"] ?? fallbackMessages.en,
    es: fallbackMessages.es ?? fallbackMessages.en,
  },
  helpVideoByLocale: defaultHelpVideos,
  loading: false,
  setLocaleMessages: (locale, dict) => {
    set({ byLocale: { ...get().byLocale, [locale]: dict } });
  },
  hydrateLocale: async (locale, region) => {
    const key = `${locale}:${region}`;
    const existing = inFlight.get(key);
    if (existing) {
      await existing;
      return;
    }

    const promise = (async () => {
      set({ loading: true });
      try {
        const params = new URLSearchParams({ locale, region });
        const fiatCurrency = usePreferencesStore.getState().fiatCurrency;
        const res = await fetch(`/api/i18n/messages?${params.toString()}`, {
          headers: {
            "x-user-locale": locale,
            "x-user-region": region,
            "x-user-fiat-currency": fiatCurrency,
          },
          cache: "force-cache",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { locale?: I18nLocale; messages?: Dictionary; helpVideoUrl?: string };
        if (!data.messages) return;
        const resolved = isLocale(data.locale) ? data.locale : locale;
        const helpVideoByLocale = data.helpVideoUrl
          ? { ...get().helpVideoByLocale, [resolved]: data.helpVideoUrl }
          : get().helpVideoByLocale;
        set({ byLocale: { ...get().byLocale, [resolved]: data.messages }, helpVideoByLocale });
      } finally {
        set({ loading: false });
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, promise);
    await promise;
  },
  hydrateDetected: async (geo) => {
    const key = `detected:${geo?.lat ?? "na"}:${geo?.lng ?? "na"}`;
    const existing = inFlight.get(key);
    if (existing) {
      await existing;
      return null;
    }

    let resolved: { locale: I18nLocale; region: I18nRegion } | null = null;
    const promise = (async () => {
      set({ loading: true });
      try {
        const headers: Record<string, string> = {};
        if (typeof geo?.lat === "number" && typeof geo?.lng === "number") {
          headers["x-user-geo-lat"] = String(geo.lat);
          headers["x-user-geo-lng"] = String(geo.lng);
        }
        const res = await fetch("/api/i18n/messages", { headers, cache: "force-cache" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          locale?: I18nLocale;
          region?: I18nRegion;
          messages?: Dictionary;
          helpVideoUrl?: string;
        };
        if (!isLocale(data.locale) || !data.region || !data.messages) return;
        const helpVideoByLocale = data.helpVideoUrl
          ? { ...get().helpVideoByLocale, [data.locale]: data.helpVideoUrl }
          : get().helpVideoByLocale;
        set({ byLocale: { ...get().byLocale, [data.locale]: data.messages }, helpVideoByLocale });
        resolved = { locale: data.locale, region: data.region };
      } finally {
        set({ loading: false });
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, promise);
    await promise;
    return resolved;
  },
}));
