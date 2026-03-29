"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const IOS_STORE_URL = "https://apps.apple.com/app/pera-algo-wallet/id1459898525";
const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=com.algorand.android";
const PERA_WEB_HOME = "https://perawallet.app/";
const REDIRECT_TIMEOUT_MS = 1500;

type UiState = "opening" | "redirecting" | "desktop" | "invalid";
type LocaleCode = "en" | "pt-BR" | "es";

const messages: Record<LocaleCode, Record<string, string>> = {
  en: {
    openingTitle: "Opening Pera Wallet...",
    openingBody: "If the app does not open, we will redirect you automatically.",
    redirectingTitle: "Redirecting you...",
    redirectingBody: "Taking you to the correct destination.",
    desktopTitle: "Redirecting you...",
    desktopBody: "Desktop detected. Sending you to Pera web.",
    invalidTitle: "Invalid payment link",
    invalidBody: "This link is missing valid wallet connection parameters.",
    fallbackAction: "Open manually",
  },
  "pt-BR": {
    openingTitle: "Abrindo a Pera Wallet...",
    openingBody: "Se o app nao abrir, vamos redirecionar voce automaticamente.",
    redirectingTitle: "Redirecionando voce...",
    redirectingBody: "Levando voce para o destino correto.",
    desktopTitle: "Redirecionando voce...",
    desktopBody: "Desktop detectado. Enviando voce para a Pera web.",
    invalidTitle: "Link de pagamento invalido",
    invalidBody: "Este link nao tem parametros validos de conexao da carteira.",
    fallbackAction: "Abrir manualmente",
  },
  es: {
    openingTitle: "Abriendo Pera Wallet...",
    openingBody: "Si la app no se abre, te redirigiremos automaticamente.",
    redirectingTitle: "Redirigiendote...",
    redirectingBody: "Llevandote al destino correcto.",
    desktopTitle: "Redirigiendote...",
    desktopBody: "Desktop detectado. Enviandote a Pera web.",
    invalidTitle: "Enlace de pago invalido",
    invalidBody: "A este enlace le faltan parametros validos de conexion de wallet.",
    fallbackAction: "Abrir manualmente",
  },
};

type DeviceKind = "ios" | "android" | "desktop";

function detectDevice(userAgent: string): DeviceKind {
  const ua = userAgent.toLowerCase();

  // Device detection keeps desktop users on web fallback and only deep-links on mobile.
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function decodeParamIfNeeded(value: string, expectedPrefix: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith(expectedPrefix)) return trimmed;

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function normalizeWalletConnectUri(rawUri: string | null): string | null {
  if (!rawUri) return null;
  const decoded = decodeParamIfNeeded(rawUri, "wc:");
  return decoded.startsWith("wc:") ? decoded : null;
}

function normalizeDeepLink(rawLink: string | null): string | null {
  if (!rawLink) return null;
  const decoded = decodeParamIfNeeded(rawLink, "perawallet://");

  if (!decoded.startsWith("perawallet://")) return null;

  // Guard against script injection and malformed public links.
  if (decoded.toLowerCase().startsWith("javascript:")) return null;

  return decoded;
}

function buildLinks(searchParams: Pick<URLSearchParams, "get">) {
  const rawUri = searchParams.get("uri");
  const rawLink = searchParams.get("link");
  const id = searchParams.get("id");

  const wcUri = normalizeWalletConnectUri(rawUri);
  const directLink = normalizeDeepLink(rawLink);

  let deepLink: string | null = directLink;
  if (!deepLink && wcUri) {
    deepLink = `perawallet://wc?uri=${encodeURIComponent(wcUri)}`;
  }

  const webFallbackUrl = wcUri
    ? `https://perawallet.app/wc?uri=${encodeURIComponent(wcUri)}`
    : PERA_WEB_HOME;

  return { deepLink, wcUri, webFallbackUrl, id };
}

function detectLocale(): LocaleCode {
  if (typeof navigator === "undefined") return "en";

  const language = navigator.language.toLowerCase();
  if (language.startsWith("pt")) return "pt-BR";
  if (language.startsWith("es")) return "es";
  return "en";
}

export function PeraRedirectClient() {
  const searchParams = useSearchParams();
  const locale = useMemo(detectLocale, []);
  const t = messages[locale];

  const [uiState, setUiState] = useState<UiState>("opening");
  const [manualHref, setManualHref] = useState<string>(PERA_WEB_HOME);

  useEffect(() => {
    const { deepLink, webFallbackUrl } = buildLinks(searchParams);
    setManualHref(webFallbackUrl);

    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const device = detectDevice(userAgent);

    if (device === "desktop") {
      setUiState("desktop");
      window.location.replace(webFallbackUrl);
      return;
    }

    if (!deepLink) {
      setUiState("invalid");
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Deep-link attempt on mobile first. If the app is installed it should open immediately.
    setUiState("opening");
    window.location.href = deepLink;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    // Fallback after a short delay when deep-link does not open the wallet app.
    timeoutId = setTimeout(() => {
      setUiState("redirecting");
      window.location.replace(device === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL);
    }, REDIRECT_TIMEOUT_MS);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">
          {uiState === "invalid"
            ? t.invalidTitle
            : uiState === "redirecting"
              ? t.redirectingTitle
              : uiState === "desktop"
                ? t.desktopTitle
                : t.openingTitle}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {uiState === "invalid"
            ? t.invalidBody
            : uiState === "redirecting"
              ? t.redirectingBody
              : uiState === "desktop"
                ? t.desktopBody
                : t.openingBody}
        </p>
        <a
          href={manualHref}
          className="mt-4 inline-flex rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          {t.fallbackAction}
        </a>
      </section>
    </main>
  );
}
