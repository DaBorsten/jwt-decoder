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
    <div className="w-full min-h-screen flex items-center justify-center bg-background dark px-2 py-8">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl p-8 flex flex-col gap-8 border border-border">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-2 text-center">
          JWT Decoder
        </h2>
        <div className="flex flex-col gap-4">
          <label
            htmlFor="jwt-input"
            className="text-base font-semibold text-primary mb-1"
          >
            JWT Token
          </label>
          <div>
            <textarea
              id="jwt-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              placeholder="JWT Token hier eingeben..."
              className="w-full min-h-[120px] bg-background border-2 border-dashed border-border rounded-lg p-4 text-base text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary transition resize-vertical"
              style={{ boxShadow: "0 1px 4px #0002" }}
            />
          </div>
          {error && (
            <div className="text-destructive font-semibold mt-2">
              <b>Fehler:</b> {error}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {/* Decoded Header Section */}
          <section className="relative bg-muted border border-border rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-primary mb-2">
              Decoded Header
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {
                navigator.clipboard.writeText(
                  result ? JSON.stringify(result.header, null, 2) : "",
                );
                toast.success("Header wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <div className="bg-background rounded-lg p-3 mt-4 overflow-x-auto text-[15px] font-mono border border-border">
              {result && result.header ? (
                <JsonWithTooltips
                  data={result.header}
                  colorKey="text-blue-400"
                />
              ) : (
                <span className="text-muted-foreground"> </span>
              )}
            </div>
          </section>

          {/* Decoded Payload Section */}
          <section className="relative bg-muted border border-border rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-2">Decoded Payload</h3>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {
                navigator.clipboard.writeText(
                  result ? JSON.stringify(result.payload, null, 2) : "",
                );
                toast.success("Payload wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <div className="bg-background rounded-lg p-3 mt-4 overflow-x-auto text-[15px] font-mono border border-border">
              {result && result.payload ? (
                <JsonWithTooltips
                  data={result.payload}
                  colorKey="text-blue-400"
                />
              ) : (
                <span className="text-muted-foreground"> </span>
              )}
            </div>
          </section>

          {/* JWT Signature Verification (Optional) Section */}
          <section className="relative bg-muted border border-border rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-2">
              JWT Signature Verification{" "}
              <span className="font-normal text-sm text-muted-foreground">
                (Optional)
              </span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {
                navigator.clipboard.writeText(result ? result.signature : "");
                toast.success("Signature wurde in die Zwischenablage kopiert!");
              }}
            >
              Copy
            </Button>
            <div className="bg-background rounded-lg p-3 mt-4 overflow-x-auto text-[15px] font-mono border border-border">
              {result ? result.signature : ""}
            </div>
            <div className="text-muted-foreground text-sm mt-2">
              Hier könnte eine Signature-Prüfung erfolgen, wenn ein Schlüssel
              angegeben wird.
            </div>
          </section>

          {/* Token Info unter den Sections */}
          {result && result.payload && (
            <div className="mt-6 bg-muted p-4 rounded-lg shadow border border-border text-foreground">
              <b className="text-base">Token Info:</b>
              <ul className="pl-5 text-[15px]">
                {result.payload.exp && (
                  <li>
                    <b>Läuft ab am:</b>{" "}
                    {new Date(result.payload.exp * 1000).toLocaleString()}
                    <br />
                    <b>Status:</b>{" "}
                    {Date.now() < result.payload.exp * 1000 ? (
                      <span className="text-green-400">✅ Gültig</span>
                    ) : (
                      <span className="text-red-400">❌ Abgelaufen</span>
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

function JsonWithTooltips({ data, colorKey }: { data: any; colorKey: string }) {
  const json = JSON.stringify(data, null, 2);
  const keyRegex = /^\s*"([^"]+)":/;
  return (
    <code>
      {json.split("\n").map((line, i) => {
        const match = keyRegex.exec(line);
        if (match) {
          const key: string = match[1] ?? "";
          const before = line.slice(0, line.indexOf('"'));
          const after = line.slice(
            line.indexOf('"', line.indexOf('"') + 1) + 1,
          );
          return (
            <div key={i} style={{ whiteSpace: "pre" }}>
              {before}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`${colorKey ?? ""} font-semibold cursor-pointer`}
                    style={{
                      cursor: tooltipTextForKey(key) ? "help" : "default",
                    }}
                  >{`"${key}"`}</span>
                </TooltipTrigger>
                {tooltipTextForKey(key) ? (
                  <TooltipContent>
                    {tooltipTextForKey(key) || ""}
                  </TooltipContent>
                ) : null}
              </Tooltip>
              {after}
            </div>
          );
        } else {
          // Highlight values: numbers, strings, booleans, null
          let highlighted = line
            .replace(
              /(: )("[^"]*")/g,
              '$1<span class="text-green-400">$2</span>',
            ) // strings
            .replace(
              /(: )(\d+(?:\.\d+)?)/g,
              '$1<span class="text-orange-400">$2</span>',
            ) // numbers
            .replace(
              /(: )(true|false)/g,
              '$1<span class="text-purple-400">$2</span>',
            ) // booleans
            .replace(/(: )(null)/g, '$1<span class="text-gray-400">$2</span>'); // null
          return (
            <div
              key={i}
              style={{ whiteSpace: "pre" }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          );
        }
      })}
    </code>
  );
}

export default JWTDecoder;
