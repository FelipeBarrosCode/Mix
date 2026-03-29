type BuildPeraDeepLinkInput = {
  address: string;
  assetId: number;
  amountBaseUnits?: string;
  note?: string;
};

export function buildPeraDeepLink({ address, assetId, amountBaseUnits, note }: BuildPeraDeepLinkInput): string {
  const params = new URLSearchParams({ asset: String(assetId) });
  if (typeof amountBaseUnits === "string" && amountBaseUnits.length > 0) {
    params.set("amount", amountBaseUnits);
  }
  if (note) {
    params.set("note", note);
  }
  return `perawallet://${address}?${params.toString()}`;
}

type BuildPeraRedirectLinkInput = {
  deepLink: string;
  origin?: string;
};

export function buildPeraRedirectLink({ deepLink, origin }: BuildPeraRedirectLinkInput): string {
  const params = new URLSearchParams({ link: deepLink });
  const relativePath = `/connect/pera?${params.toString()}`;

  if (!origin) return relativePath;

  try {
    return new URL(relativePath, origin).toString();
  } catch {
    return relativePath;
  }
}
