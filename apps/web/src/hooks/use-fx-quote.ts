import { useQuery } from "@tanstack/react-query";
import { fetchFxQuote } from "@/lib/fx/quotes";
import { fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";

export function useFxQuote() {
  const region = usePreferencesStore((s) => s.region);
  const currency = fiatFromRegion(region);

  return useQuery({
    queryKey: ["fx-quote", currency],
    queryFn: () => fetchFxQuote(currency),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    retry: 2,
  });
}
