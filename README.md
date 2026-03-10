# Mix

Mobile-first, non-custodial USDC app on Algorand.

Mix is a wallet-signing dApp. The app prepares transactions and user flows, and the user signs in Pera Wallet.

## What Mix is (and is not)

- Non-custodial: no private key storage in app.
- Wallet-first: signing happens in Pera Wallet.
- On-chain execution: transfers and swaps settle on Algorand.
- Not a bank: no custody, no fiat account rails, no chargebacks.

## Current architecture

- Frontend: Next.js App Router + TypeScript (`apps/web`).
- State: Zustand.
- Data fetching/cache: TanStack Query.
- Wallet: `@perawallet/connect` (Pera-only by product decision).
- Chain SDK: `algosdk`.
- Swap routing/tx generation: `@tinymanorg/tinyman-js-sdk`.
- QR: `qr-scanner` and `qrcode`.
- Localization: in-app dictionaries + `/api/i18n/messages` resolver.

## Product surfaces

- `send` -> send USDC with fiat equivalent preview.
- `receive` -> receive info + fixed QR behavior.
- `swap` (Exchange) -> Tinyman route, sign in Pera, submit on-chain.
- `cash`, `cash-in`, `cash-out` -> guided off-chain provider pages.
- `investments` -> risk matrix and detail pages.
- `contacts`, `settings`, `scan`, `pay`, `confirm`, `receipt`.

## Monorepo layout

```text
/
  apps/
    web/
      src/
        app/
        components/
        features/
        hooks/
        lib/
        stores/
        test/
  .github/
    workflows/
```

## Security model

- Non-custodial signing only.
- CSP and security headers in `apps/web/next.config.ts`.
- CORS allowlist in `apps/web/src/app/api/i18n/messages/route.ts`.
- Endpoint validation + health probes before custom RPC/indexer save.
- Trusted endpoint model with advanced override in Settings.
- Swap prechecks before sign:
  - fresh route refetch
  - stale route guard
  - price impact guard
  - amount/output sanity checks
- Dependency and lockfile checks in CI (`.github/workflows/security-ci.yml`).

## Network and assets

Defined in `apps/web/src/lib/algorand/network.ts`.

- TestNet USDC ASA: `10458941`
- MainNet USDC ASA: `31566704`

Default RPC/indexer endpoints are Algonode + Nodely with fallback logic.

## Environment variables

Set in `apps/web/.env.local`.

- `NEXT_PUBLIC_DEFAULT_NETWORK` -> `testnet` or `mainnet`
- `NEXT_PUBLIC_TESTNET_ALGOD` (optional)
- `NEXT_PUBLIC_TESTNET_INDEXER` (optional)
- `NEXT_PUBLIC_MAINNET_ALGOD` (optional)
- `NEXT_PUBLIC_MAINNET_INDEXER` (optional)
- `NEXT_PUBLIC_APP_ORIGIN` (recommended for strict API CORS)
- `APP_ORIGIN` (server-side CORS alternative)

Important for CORS:

- Use origin only, no path.
- Correct: `https://example.trycloudflare.com`
- Incorrect: `https://example.trycloudflare.com/home`

## Local development

From repository root:

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Scripts

Root scripts:

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
```

Web package scripts are the same under `apps/web`.

## Testing

Run:

```bash
pnpm test
```

Current tests include:

- amount conversion
- URI parsing
- address validation
- send flow smoke checks

## CI security workflow

`/.github/workflows/security-ci.yml` runs on PRs and `main` pushes:

- frozen lockfile install
- lockfile consistency check
- web app build
- production dependency audit

## Operational notes

- Pera may show grouped swap transactions where some entries show `0` value; this is expected for router/app-call style swap groups.
- Custom RPC/indexer hosts outside trusted domains require enabling advanced mode in Settings.
- If using dynamic tunnel domains, update `NEXT_PUBLIC_APP_ORIGIN`/`APP_ORIGIN` whenever the tunnel hostname changes.

## Disclaimer

Mix is software that assists transaction preparation and routing. Users are responsible for wallet security, signing decisions, network selection, and jurisdiction-specific compliance.
