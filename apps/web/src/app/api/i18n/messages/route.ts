import { NextRequest, NextResponse } from "next/server";
import { messages } from "@/lib/i18n/messages";
import { I18nLocale, I18nRegion, fiatFromRegion, isLocale, isRegion, localeFromRegion, regionFromCountryCode, regionFromGeoCoordinates } from "@/lib/i18n/locale";

const helpVideoByLocale: Record<I18nLocale, string> = {
  en: "https://youtu.be/_edZbCDtTPI",
  es: "https://youtu.be/gyxkSlbem4U",
  "pt-BR": "https://youtu.be/6M6zI8ts9cY",
};

function localeFromAcceptLanguage(value: string | null): I18nLocale {
  const lower = (value ?? "").toLowerCase();
  if (lower.includes("pt")) return "pt-BR";
  if (lower.includes("es")) return "es";
  return "en";
}

function resolveRegion(req: NextRequest): I18nRegion {
  const queryRegion = req.nextUrl.searchParams.get("region");
  if (isRegion(queryRegion)) return queryRegion;

  const headerRegion = req.headers.get("x-user-region");
  if (isRegion(headerRegion)) return headerRegion;

  const geoLat = Number(req.headers.get("x-user-geo-lat"));
  const geoLng = Number(req.headers.get("x-user-geo-lng"));
  const fromGeo = regionFromGeoCoordinates(geoLat, geoLng);
  if (fromGeo !== "GLOBAL") return fromGeo;

  const countryHeader = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
  return regionFromCountryCode(countryHeader);
}

function resolveLocale(req: NextRequest, region: I18nRegion): I18nLocale {
  const queryLocale = req.nextUrl.searchParams.get("locale");
  if (isLocale(queryLocale)) return queryLocale;

  const headerLocale = req.headers.get("x-user-locale");
  if (isLocale(headerLocale)) return headerLocale;

  if (region !== "GLOBAL") return localeFromRegion(region);

  return localeFromAcceptLanguage(req.headers.get("accept-language"));
}

export async function GET(req: NextRequest) {
  const region = resolveRegion(req);
  const locale = resolveLocale(req, region);
  return NextResponse.json(
    {
      locale,
      region,
      fiatCurrency: fiatFromRegion(region),
      helpVideoUrl: helpVideoByLocale[locale],
      messages: messages[locale] ?? messages.en,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        Vary: "Accept-Language, X-User-Locale, X-User-Region, X-User-Geo-Lat, X-User-Geo-Lng, CF-IPCountry, X-Vercel-IP-Country",
      },
    },
  );
}
