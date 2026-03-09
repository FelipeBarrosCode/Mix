import algosdk from "algosdk";

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
];

const TRUSTED_HOST_SUFFIXES = [
  ".algonode.cloud",
  ".nodely.dev",
];

const TRUSTED_HOSTS = new Set([
  "algonode.cloud",
  "nodely.dev",
]);

function withTimeout<T>(promise: Promise<T>, timeoutMs = 8_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Endpoint timed out")), timeoutMs)),
  ]);
}

export function validatePublicHttpsEndpoint(raw: string, label: string): string {
  const value = raw.trim();
  if (!value) {
    throw new Error(`${label} endpoint is empty`);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} endpoint is not a valid URL`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} endpoint must use https`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} endpoint cannot include credentials`);
  }
  if (url.search || url.hash) {
    throw new Error(`${label} endpoint cannot include query params or hash`);
  }

  const hostname = url.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error(`${label} endpoint must be a public host`);
  }

  return url.origin;
}

export function isTrustedEndpoint(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    if (TRUSTED_HOSTS.has(hostname)) return true;
    return TRUSTED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export async function probeAlgodEndpoint(endpoint: string) {
  const client = new algosdk.Algodv2("", endpoint, "");
  await withTimeout(client.getTransactionParams().do());
}

export async function probeIndexerEndpoint(endpoint: string) {
  const client = new algosdk.Indexer("", endpoint, "");
  await withTimeout(client.makeHealthCheck().do());
}
