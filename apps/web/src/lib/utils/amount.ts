export function decimalToBaseUnits(decimal: string, decimals: number) {
  const normalized = decimal.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error("Invalid decimal amount");
  }

  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) {
    throw new Error("Too many decimal places");
  }

  const base = `${whole}${fraction.padEnd(decimals, "0")}`.replace(/^0+(?=\d)/, "") || "0";
  return BigInt(base);
}

export function baseUnitsToDecimal(baseUnits: bigint, decimals: number) {
  const s = baseUnits.toString().padStart(decimals + 1, "0");
  const whole = s.slice(0, -decimals) || "0";
  const fraction = s.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
