import algosdk from "algosdk";

export function isValidAlgorandAddress(value: string) {
  try {
    return algosdk.isValidAddress(value.trim());
  } catch {
    return false;
  }
}

export function isAlgoName(value: string) {
  return /^[a-z0-9-]{1,27}\.algo$/i.test(value.trim());
}
