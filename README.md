# Mix (Algorand USDC Pix-like payments)

Mobile-first, non-custodial, serverless USDC payments on Algorand.

This app is a UI/UX facilitator only: it resolves recipients, builds transactions, and hands signing to Pera Wallet.

## Non-custodial disclaimer

- We do **not** hold your keys.
- We do **not** hold your funds.
- Signing is done in Pera Wallet.
- Payments are on-chain and irreversible unless recipient voluntarily returns funds.
- No banking Pix integration, no fiat rails, no custody, no dispute guarantees.

## Stack

- Next.js App Router + TypeScript
- Tailwind + shadcn-style components
- Zustand
- TanStack Query
- zod + react-hook-form
- algosdk
- Pera Wallet Connect
- AlgoKit-style contract workflow (Python/PyTeal contract source + deploy scripts)

## Monorepo layout

```
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
  contracts/
    invoice/
```

## Environment/config

Copy `apps/web/.env.example` to `apps/web/.env.local`.

Important vars:

- `NEXT_PUBLIC_DEFAULT_NETWORK` (`testnet` or `mainnet`)
- `NEXT_PUBLIC_TESTNET_INVOICE_APP_ID`
- `NEXT_PUBLIC_MAINNET_INVOICE_APP_ID`
- Optional endpoint overrides:
  - `NEXT_PUBLIC_TESTNET_ALGOD`
  - `NEXT_PUBLIC_TESTNET_INDEXER`
  - `NEXT_PUBLIC_MAINNET_ALGOD`
  - `NEXT_PUBLIC_MAINNET_INDEXER`

Runtime network values are also editable in `/settings` and persisted in localStorage.

## Network config

Centralized in `apps/web/src/lib/algorand/network.ts`:

- algod endpoint list (with fallback)
- indexer endpoint list (with fallback)
- USDC asset ID
- NFD registry app ID (`.algo` resolution)
- invoice contract app ID
- explorer base URL

Defaults:

- TestNet USDC: `10458941`
- MainNet USDC: `31566704`

## Contract deploy steps

Contract source is in `contracts/invoice/contract.py`.

1. Install Python deps:

```bash
cd contracts/invoice
pip install -r requirements.txt
```

2. Compile TEAL:

```bash
make compile
```

3. Set env for deploy:

- `TESTNET_ALGOD_URL`, `TESTNET_ALGOD_TOKEN`, `TESTNET_DEPLOYER_MNEMONIC`
- `MAINNET_ALGOD_URL`, `MAINNET_ALGOD_TOKEN`, `MAINNET_DEPLOYER_MNEMONIC`

4. Deploy:

```bash
make deploy-testnet
make deploy-mainnet
```

5. Put resulting app IDs into:

- `.env.local`
- or `/settings` in-app

## Running locally

From repo root:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Core flows

- Send USDC to address or `.algo`
- Live fiat-equivalent display (USD/BRL/EUR by region) for USDC amounts
- Resolve `.algo` from on-chain registry box reads (no NFD REST API)
- QR scan + QR generate + `Mix://` URI parsing
- On-chain invoice create/pay/cancel flows
- Local-only contacts and reminder drafts
- Cash in/out guidance hubs with region-aware provider listings and WalletConnect dApp links where supported

## Testing

Run tests:

```bash
pnpm test
```

Included:

- amount conversion tests
- URI parsing tests
- address validation tests
- invoice box parsing tests
- smoke tests for send and invoice flow guards

## Manual TestNet verification

### Send flow

1. Set network to TestNet.
2. Connect Pera Wallet test account.
3. Ensure sender and receiver are opted into USDC TestNet asset.
4. Use `/send` with address or `.algo`.
5. Confirm details and sign in Pera.
6. Verify `/receipt/[txid]` explorer link.

### Invoice flow

1. Deploy invoice contract to TestNet.
2. Set TestNet invoice app ID in `/settings`.
3. Open `/invoice/new`, create invoice.
4. Open generated `/invoice/[id]`.
5. Pay invoice from payer wallet through `/send?invoiceId=...` path.
6. Re-open invoice page and confirm status is `PAID`.

## Security notes

- No private key handling in app.
- No backend, no custody, no hidden server reconciliation.
- Local storage only for non-sensitive state (contacts, caches, history, drafts).
- Wallet session failures and signature rejections are surfaced as user-facing errors.

## Limitations

- No fiat features.
- No payment reversals/disputes.
- No background execution for scheduled payments.
- `.algo` resolution depends on configured on-chain registry layout.
- Cash in/out providers are external services; availability, KYC, and rates vary by region.
- This app does not custody funds during fiat on-ramp/off-ramp and does not guarantee third-party provider execution.
