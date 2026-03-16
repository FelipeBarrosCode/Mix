import { useEffect } from "react";
import { fallbackMessages } from "@/lib/i18n/fallback";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useI18nStore } from "@/stores/i18n-store";

export function useI18n() {
  const locale = usePreferencesStore((s) => s.locale);
  const region = usePreferencesStore((s) => s.region);
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const localeManuallySet = usePreferencesStore((s) => s.localeManuallySet);
  const regionManuallySet = usePreferencesStore((s) => s.regionManuallySet);
  const geoResolved = usePreferencesStore((s) => s.geoResolved);
  const applyGeoDefaults = usePreferencesStore((s) => s.applyGeoDefaults);
  const dict = useI18nStore((s) => s.byLocale[locale] ?? fallbackMessages[locale] ?? fallbackMessages.en);
  const helpVideoUrl = useI18nStore((s) => s.helpVideoByLocale[locale] ?? "https://youtu.be/yZkmXeotLPI");
  const hydrateLocale = useI18nStore((s) => s.hydrateLocale);
  const hydrateDetected = useI18nStore((s) => s.hydrateDetected);

  useEffect(() => {
    if (!hydrated || localeManuallySet || regionManuallySet || geoResolved) return;

    const withGeo = () => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        hydrateDetected().then((value) => {
          if (value) applyGeoDefaults(value);
        }).catch(() => undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          hydrateDetected({ lat: position.coords.latitude, lng: position.coords.longitude })
            .then((value) => {
              if (value) applyGeoDefaults(value);
            })
            .catch(() => undefined);
        },
        () => {
          hydrateDetected().then((value) => {
            if (value) applyGeoDefaults(value);
          }).catch(() => undefined);
        },
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 1000 * 60 * 60 },
      );
    };

    withGeo();
  }, [applyGeoDefaults, geoResolved, hydrateDetected, hydrated, localeManuallySet, regionManuallySet]);

  useEffect(() => {
    hydrateLocale(locale, region).catch(() => undefined);
  }, [hydrateLocale, locale, region]);

  return {
    locale,
    helpVideoUrl,
    t: (key: string) => dict[key] ?? fallbackMessages.en[key] ?? key,
  };
}
