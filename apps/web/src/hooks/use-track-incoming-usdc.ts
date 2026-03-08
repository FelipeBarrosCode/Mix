import { useEffect } from "react";
import { discoverIncomingUsdcSenders } from "@/lib/algorand/incoming-contacts";
import { upsertPossibleContact } from "@/lib/storage/possible-contacts-db";

export function useTrackIncomingUsdc(input: { address?: string; usdcAssetId: number }) {
  useEffect(() => {
    if (!input.address) return;

    let active = true;

    const run = async () => {
      try {
        const rows = await discoverIncomingUsdcSenders({
          receiver: input.address!,
          usdcAssetId: input.usdcAssetId,
          limitPages: 4,
        });

        for (const row of rows) {
          if (!active) return;
          await upsertPossibleContact({
            address: row.address,
            lastReceivedAt: row.lastReceivedAt,
            txCount: row.txCount,
          });
        }

        if (rows.length > 0) {
          window.dispatchEvent(new CustomEvent("mix:possible-contacts-updated"));
        }
      } catch {
        // Silent on purpose: this is best-effort background indexing.
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [input.address, input.usdcAssetId]);
}
