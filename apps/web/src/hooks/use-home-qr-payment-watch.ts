"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { baseUnitsToDecimal } from "@/lib/utils/amount";

type WatchStatus = "idle" | "watching" | "detected" | "timed_out" | "error";

type DetectedPayment = {
  txid: string;
  sender: string;
  amount: string;
  receivedAt: string;
  confirmedRound: number;
};

type WorkerMessage =
  | { type: "started"; payload: { startedAt: number } }
  | { type: "poll_ok" }
  | { type: "poll_error"; payload: string }
  | {
      type: "payment_detected";
      payload: {
        txid: string;
        sender: string;
        amountBase: string;
        receivedAt: string;
        confirmedRound: number;
      };
    }
  | { type: "timeout" };

const UNSUPPORTED_BROWSER_ERROR = "home_payment_watch_unsupported";

export function buildHomeReceiveRequestNote(requestId: string) {
  return `mix:home:${requestId}`;
}

export function useHomeQrPaymentWatch(input: {
  enabled: boolean;
  qrReady: boolean;
  receiver?: string;
  assetId: number;
  requestNote: string;
  indexerEndpoints: string[];
}) {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<WatchStatus>("idle");
  const [pollCount, setPollCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [payment, setPayment] = useState<DetectedPayment | null>(null);

  const workerInput = useMemo(() => {
    if (!input.enabled || !input.qrReady || !input.receiver || !input.requestNote || input.indexerEndpoints.length === 0) {
      return null;
    }
    return {
      indexerEndpoints: input.indexerEndpoints,
      receiver: input.receiver,
      assetId: input.assetId,
      expectedNote: input.requestNote,
      startedAt: Date.now(),
      pollMs: 5_000,
      timeoutMs: 90_000,
    };
  }, [input.assetId, input.enabled, input.indexerEndpoints, input.qrReady, input.receiver, input.requestNote]);

  useEffect(() => {
    if (!workerInput) {
      setStatus("idle");
      setPollCount(0);
      setStartedAt(null);
      setLastError(null);
      setPayment(null);
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "stop" });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      return;
    }

    if (typeof Worker === "undefined") {
      setStatus("error");
      setLastError(UNSUPPORTED_BROWSER_ERROR);
      return;
    }

    const worker = new Worker(new URL("../workers/home-qr-payment-watch.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    setStatus("watching");
    setPollCount(0);
    setStartedAt(workerInput.startedAt);
    setLastError(null);
    setPayment(null);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === "started") {
        setStartedAt(message.payload.startedAt);
        return;
      }
      if (message.type === "poll_ok") {
        setPollCount((count) => count + 1);
        return;
      }
      if (message.type === "poll_error") {
        setStatus("error");
        setLastError(message.payload);
        return;
      }
      if (message.type === "payment_detected") {
        setStatus("detected");
        setPayment({
          txid: message.payload.txid,
          sender: message.payload.sender,
          amount: baseUnitsToDecimal(BigInt(message.payload.amountBase), 6),
          receivedAt: message.payload.receivedAt,
          confirmedRound: message.payload.confirmedRound,
        });
        return;
      }
      if (message.type === "timeout") {
        setStatus("timed_out");
      }
    };

    worker.postMessage({ type: "start", payload: workerInput });

    return () => {
      worker.postMessage({ type: "stop" });
      worker.terminate();
      if (workerRef.current === worker) {
        workerRef.current = null;
      }
    };
  }, [workerInput]);

  const secondsRemaining = useMemo(() => {
    if (!startedAt || status !== "watching") return 0;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, 90 - elapsed);
  }, [startedAt, status, pollCount]);

  return {
    status,
    pollCount,
    secondsRemaining,
    lastError,
    payment,
    unsupportedErrorCode: UNSUPPORTED_BROWSER_ERROR,
  };
}
