import type { NextConfig } from "next";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://testnet-api.algonode.cloud https://testnet-api.4160.nodely.dev https://testnet-idx.algonode.cloud https://testnet-idx.4160.nodely.dev https://mainnet-api.algonode.cloud https://mainnet-api.4160.nodely.dev https://mainnet-idx.algonode.cloud https://mainnet-idx.4160.nodely.dev https://api.coingecko.com https://api.frankfurter.app https://open.er-api.com https://bridge.walletconnect.org https://relay.walletconnect.com wss://relay.walletconnect.com https://wallet-connect-g.perawallet.app wss://wallet-connect-g.perawallet.app",
  "frame-src https://www.youtube.com https://youtube.com",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
