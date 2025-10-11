export function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch {
    return "";
  }
}

export function parseJWT(token: string) {
  token = token.trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7);
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      error:
        "Invalid JWT format: must have exactly 3 parts (Header.Payload.Signature)",
    };
  }
  const [headerB64, payloadB64, signaturePart] = parts;
  if (!headerB64 || !payloadB64 || !signaturePart) {
    return { error: "Invalid JWT: missing parts" };
  }
  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return { error: "Error decoding header or payload" };
  }
  return { header, payload, signature: signaturePart };
}
