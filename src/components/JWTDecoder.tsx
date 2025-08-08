// ...nur eine saubere, vollständige Komponente...
import React, { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

function base64UrlDecode(str: string): string {
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

function parseJWT(token: string) {
  token = token.trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7);
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      error:
        "Ungültiges JWT Format: Muss genau 3 Teile haben (Header.Payload.Signature)",
    };
  }
  const [headerB64, payloadB64, signaturePart] = parts;
  if (!headerB64 || !payloadB64 || !signaturePart) {
    return { error: "Ungültiges JWT: Fehlende Teile" };
  }
  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return { error: "Fehler beim Dekodieren von Header oder Payload" };
  }
  return { header, payload, signature: signaturePart };
}

function tooltipTextForKey(key: string): string | undefined {
  // Add more key descriptions as needed
  const descriptions: Record<string, string> = {
    alg: "Algorithm used to sign the token",
    typ: "Type of the token (usually 'JWT')",
    kid: "Key ID used to sign the token",
    iss: "Issuer - who created and signed the token",
    sub: "Subject - whom the token refers to",
    aud: "Audience - intended recipient(s)",
    exp: "Expiration time (seconds since epoch)",
    nbf: "Not valid before (seconds since epoch)",
    iat: "Issued at (seconds since epoch)",
    jti: "JWT ID - unique identifier for the token",
    // Add more as needed
  };
  return descriptions[key];
}

const JWTDecoder: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    const parsed = parseJWT(input);
    if (parsed.error) {
      setError(parsed.error);
      setResult(null);
    } else {
      setResult(parsed);
      setError(null);
    }
  }, [input]);

  return (
    <div
      style={{
        padding: 28,
        borderRadius: 16,
        boxShadow: "0 4px 32px #0003, 0 1.5px 8px #2222",
        background: "linear-gradient(135deg, #23272f 0%, #2d3748 100%)",
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 260 }}>
        <h2
          style={{
            color: "#fff",
            letterSpacing: 1,
            fontWeight: 700,
            fontSize: 26,
            marginBottom: 8,
          }}
        >
          JWT Decoder
        </h2>
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={15}
            placeholder="JWT Token hier eingeben..."
            style={{
              width: "100%",
              minHeight: 180,
              fontFamily: "monospace",
              fontSize: 16,
              boxShadow: "0 1px 4px #0002",
              resize: "vertical",
            }}
          />
        </div>
        {error && (
          <div style={{ color: "#f87171", marginBottom: 16, fontWeight: 600 }}>
            <b>Fehler:</b> {error}
          </div>
        )}
      </div>
      <div style={{ flex: 1.2, minWidth: 300 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Decoded Header Section */}
          <section
            style={{
              background: "linear-gradient(120deg, #23272f 60%, #374151 100%)",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 2px 12px #0004, 0 1px 2px #2222",
              position: "relative",
              border: "1.5px solid #374151",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "#a5b4fc",
                letterSpacing: 0.5,
              }}
            >
              Decoded Header
            </h3>
            <Button
              variant="ghost"
              size="sm"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                navigator.clipboard.writeText(
                  result ? JSON.stringify(result.header, null, 2) : "",
                );
                toast.success("Header wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <pre style={{ background: "none", color: "inherit", margin: 0, padding: 0, fontSize: 15, fontFamily: 'monospace', border: 0, marginTop: 24 }}>
              {result && result.header
                ? Object.entries(result.header).map(([key, value]) => (
                    <div key={key} style={{ display: "flex", gap: 8 }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ color: "#a5b4fc", fontWeight: 600, cursor: tooltipTextForKey(key) ? "help" : "default" }}>
                            {key}
                          </span>
                        </TooltipTrigger>
                        {tooltipTextForKey(key) && (
                          <TooltipContent>{tooltipTextForKey(key)}</TooltipContent>
                        )}
                      </Tooltip>
                      <span style={{ color: "#e0e7ef" }}>: {JSON.stringify(value)}</span>
                    </div>
                  ))
                : <span style={{ color: "#444" }}></span>}
            </pre>
          </section>

          {/* Decoded Payload Section */}
          <section
            style={{
              background: "linear-gradient(120deg, #23272f 60%, #334155 100%)",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 2px 12px #0004, 0 1px 2px #2222",
              position: "relative",
              border: "1.5px solid #334155",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "#67e8f9",
                letterSpacing: 0.5,
              }}
            >
              Decoded Payload
            </h3>
            <Button
              variant="ghost"
              size="sm"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                navigator.clipboard.writeText(
                  result ? JSON.stringify(result.payload, null, 2) : "",
                );
                toast.success("Payload wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <pre style={{ background: "none", color: "inherit", margin: 0, padding: 0, fontSize: 15, fontFamily: 'monospace', border: 0, marginTop: 24 }}>
              {result && result.payload
                ? Object.entries(result.payload).map(([key, value]) => (
                    <div key={key} style={{ display: "flex", gap: 8 }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ color: "#67e8f9", fontWeight: 600, cursor: tooltipTextForKey(key) ? "help" : "default" }}>
                            {key}
                          </span>
                        </TooltipTrigger>
                        {tooltipTextForKey(key) && (
                          <TooltipContent>{tooltipTextForKey(key)}</TooltipContent>
                        )}
                      </Tooltip>
                      <span style={{ color: "#e0e7ef" }}>: {JSON.stringify(value)}</span>
                    </div>
                  ))
                : <span style={{ color: "#444" }}></span>}
            </pre>
          </section>



          {/* JWT Signature Verification (Optional) Section */}
          <section
            style={{
              background: "linear-gradient(120deg, #23272f 60%, #475569 100%)",
              borderRadius: 10,
              padding: 18,
              boxShadow: "0 2px 12px #0004, 0 1px 2px #2222",
              position: "relative",
              border: "1.5px solid #475569",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "#cbd5e1",
                letterSpacing: 0.5,
              }}
            >
              JWT Signature Verification{" "}
              <span style={{ fontWeight: 400, fontSize: 14 }}>(Optional)</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                cursor: "pointer",
              }}
              onClick={() => {
                navigator.clipboard.writeText(result ? result.signature : "");
                toast.success("Signature wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <SyntaxHighlighter
              language="text"
              style={vscDarkPlus}
              customStyle={{ borderRadius: 6, fontSize: 15, marginTop: 24 }}
            >
              {result ? result.signature : ""}
            </SyntaxHighlighter>
            <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 8 }}>
              Hier könnte eine Signature-Prüfung erfolgen, wenn ein Schlüssel
              angegeben wird.
            </div>
          </section>

          {/* Token Info unter den Sections */}
          {result && result.payload && (
            <div
              style={{
                marginTop: 24,
                background:
                  "linear-gradient(90deg, #1e293b 60%, #10b98122 100%)",
                padding: 16,
                borderRadius: 8,
                boxShadow: "0 1px 6px #10b98144",
                border: "1.5px solid #10b98155",
                color: "#e0f2fe",
              }}
            >
              <b style={{ fontSize: 16, color: "#6ee7b7" }}>Token Info:</b>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15 }}>
                {result.payload.exp && (
                  <li>
                    <b>Läuft ab am:</b>{" "}
                    {new Date(result.payload.exp * 1000).toLocaleString()}
                    <br />
                    <b>Status:</b>{" "}
                    {Date.now() < result.payload.exp * 1000 ? (
                      <span style={{ color: "green" }}>✅ Gültig</span>
                    ) : (
                      <span style={{ color: "red" }}>❌ Abgelaufen</span>
                    )}
                  </li>
                )}
                {result.payload.iat && (
                  <li>
                    <b>Ausgestellt am:</b>{" "}
                    {new Date(result.payload.iat * 1000).toLocaleString()}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JWTDecoder;
