import QRCode from "qrcode";

export async function qrToDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 512,
    color: { dark: "#0b1221", light: "#ffffff" },
  });
}
