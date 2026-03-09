import { NextRequest, NextResponse } from "next/server";
import { messages } from "@/lib/i18n/messages";
import { I18nLocale, I18nRegion, fiatFromRegion, isLocale, isRegion, localeFromRegion, regionFromCountryCode, regionFromGeoCoordinates } from "@/lib/i18n/locale";

const configuredOriginRaw = process.env.NEXT_PUBLIC_APP_ORIGIN ?? process.env.APP_ORIGIN ?? "";

function normalizeOrigin(value: string): string {
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    try {
      return new URL(`https://${value}`).origin;
    } catch {
      return "";
    }
  }
}

const configuredOrigin = normalizeOrigin(configuredOriginRaw);

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

function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const allowed = configuredOrigin || req.nextUrl.origin;
  return origin === allowed ? origin : null;
}

function corsHeaders(allowedOrigin: string | null): Record<string, string> {
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Locale, X-User-Region, X-User-Geo-Lat, X-User-Geo-Lng",
  };
}

export async function OPTIONS(req: NextRequest) {
  const allowedOrigin = getAllowedOrigin(req);
  if (!allowedOrigin) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(allowedOrigin),
      Vary: "Origin",
    },
  });
}

export async function GET(req: NextRequest) {
  const requestOrigin = req.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(req);
  if (requestOrigin && !allowedOrigin) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403, headers: { Vary: "Origin" } });
  }

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
        ...corsHeaders(allowedOrigin),
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        Vary: "Origin, Accept-Language, X-User-Locale, X-User-Region, X-User-Geo-Lat, X-User-Geo-Lng, CF-IPCountry, X-Vercel-IP-Country",
      },
    },
  );
}
