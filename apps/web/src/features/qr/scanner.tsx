"use client";

import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";

export function QrScannerView({ onResult }: { onResult: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => onResult(result.data),
      {
        returnDetailedScanResult: true,
        preferredCamera: "environment",
      },
    );
    scanner.start().catch(() => undefined);
    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [onResult]);

  return <video ref={videoRef} className="h-[360px] w-full rounded-2xl border border-border object-cover" />;
}
