// Beschreibungen für JWT Felder
const jwtKeyDescriptions: Record<string, string> = {
  alg: "Signature or encryption algorithm",
  typ: "Type of the token (usually 'JWT')",
  kid: "Key ID used to sign the token",
  iss: "Issuer (who created and signed this token)",
  sub: "Subject (whom the token refers to)",
  aud: "Audience (who or what the token is intended for)",
  exp: "Expiration time (seconds since epoch)",
  nbf: "Not valid before (seconds since epoch)",
  iat: "Issued at (seconds since Unix epoch)",
  jti: "JWT ID (unique identifier for this token)",
  // Add more as needed
};

export function tooltipTextForKey(key: string): string | undefined {
  return jwtKeyDescriptions[key];
}
