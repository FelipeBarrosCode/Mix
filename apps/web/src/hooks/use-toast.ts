import { useToastStore } from "@/stores/toast-store";

export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    toast: push,
  };
}
