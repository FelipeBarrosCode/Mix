const DEFAULT_HELP_VIDEO_BY_LOCALE: Record<string, string> = {
  en: "https://youtu.be/yZkmXeotLPI",
  es: "https://youtu.be/UoJEmFEkH-A",
  "pt-BR": "https://youtu.be/8WLNP3onJRQ",
};

const ALLOWED_HELP_HOSTS = new Set(["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com"]);

export function toSafeHelpVideoUrl(input: string, locale: string): string {
  const fallback = DEFAULT_HELP_VIDEO_BY_LOCALE[locale] ?? DEFAULT_HELP_VIDEO_BY_LOCALE.en;
  try {
    const url = new URL(input);
    if (!ALLOWED_HELP_HOSTS.has(url.hostname)) return fallback;
    if (url.protocol !== "https:") return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export function toSafeHelpEmbedUrl(input: string, locale: string): string {
  const safe = toSafeHelpVideoUrl(input, locale);
  try {
    const url = new URL(safe);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\//, "");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (url.pathname.startsWith("/embed/")) return url.toString();
    }
  } catch {
    return "https://www.youtube.com/embed/yZkmXeotLPI";
  }
  return "https://www.youtube.com/embed/yZkmXeotLPI";
}
