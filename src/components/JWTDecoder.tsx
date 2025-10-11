// ...nur eine saubere, vollständige Komponente...
import React, { useState } from "react";
import CopyBlock from "./CopyBlock";

import { parseJWT } from "../lib/jwtUtils";
import JsonWithTooltips from "../lib/JsonWithTooltips";

const JWTDecoder: React.FC = () => {
  const [input, setInput] = useState("");
  type JWTResult =
    | {
        header: Record<string, unknown>;
        payload: Record<string, unknown>;
        signature: string;
      }
    | { error: string }
    | null;
  const [result, setResult] = useState<JWTResult>(null);

  function isDecodedJWT(r: JWTResult): r is {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
  } {
    return !!r && "header" in r && "payload" in r && "signature" in r;
  }
  const [error, setError] = useState<string | null>(null);

  // Refs & Highlight-Funktionen für das JWT Textarea Overlay
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const preRef = React.useRef<HTMLPreElement | null>(null);

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightJWT(str: string) {
    if (!str) return "";
    // Zeichenweise parsen, damit aufeinanderfolgende Punkte korrekt (.. => ..) dargestellt werden
    // und keine künstlichen &nbsp; Segmente entstehen, die den Caret verschieben.
    let segmentIndex = 0; // 0 = header, 1 = payload, 2 = signature
    let currentClass = "";
    let buffer = "";
    const out: string[] = [];

    function colorFor(idx: number) {
      if (idx === 0) return "text-green-400";
      if (idx === 2) return "text-blue-400";
      return "text-foreground"; // default (weiß)
    }

    function flush() {
      if (!buffer) return;
      out.push(`<span class="${currentClass}">${buffer}</span>`);
      buffer = "";
    }

    for (let i = 0; i < str.length; i++) {
      const ch: string = str[i] ?? "";
      if (ch === ".") {
        // Punkt beenden aktuellen Buffer und selbstständig rot darstellen
        flush();
        out.push('<span class="text-red-500">.</span>');
        segmentIndex += 1; // nächstes Segment beginnt
        currentClass = ""; // Force Neufindung der Farbe danach
        continue;
      }
      const neededClass = colorFor(segmentIndex);
      if (neededClass !== currentClass) {
        flush();
        currentClass = neededClass;
      }
      // Escape & HTML-safe + Spaces in &nbsp; umwandeln zur Ausrichtung
      let escaped = escapeHtml(ch);
      if (ch === " ") escaped = "&nbsp;"; // Space sichtbar erhalten
      buffer += escaped;
    }
    flush();
    return out.join("");
  }

  function syncScroll() {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }

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
    <div className="w-full h-screen min-h-screen flex items-stretch justify-center bg-background dark px-8 py-8">
      <div className="w-full  bg-card rounded-2xl shadow-2xl py-8 pl-8 flex flex-row gap-8 border border-border h-full">
        {/* Linke Spalte: Eingabe */}
        <div className="flex flex-col gap-6 w-[50%] h-full">
          <div className="flex flex-col mb-2 h-full">
            <h3 className="text-lg font-bold text-primary mb-2">JWT Token</h3>
            {/* Overlay Highlight Textarea */}
            <div className="relative flex-1 min-h-0 font-mono text-base">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="absolute inset-0 m-0 overflow-auto pointer-events-none whitespace-pre-wrap break-words rounded-lg p-4 bg-background border-2 border-dashed border-border"
                style={{ boxShadow: "0 1px 4px #0002" }}
                dangerouslySetInnerHTML={{
                  __html: input
                    ? highlightJWT(input)
                    : `<span class="text-muted-foreground">JWT Token hier eingeben...</span>`,
                }}
              />
              <textarea
                ref={textareaRef}
                id="jwt-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={syncScroll}
                placeholder=""
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent border-2 border-dashed border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary text-transparent caret-foreground selection:bg-primary/30"
                style={{ boxShadow: "0 1px 4px #0002" }}
                aria-label="JWT Token"
              />
            </div>
            {error && (
              <div className="text-destructive font-semibold mt-2">
                <b>Fehler:</b> {error}
              </div>
            )}
          </div>
          {/* Token Info unter den Sections */}
          {isDecodedJWT(result) &&
            result.payload &&
            (() => {
              const exp =
                typeof result.payload.exp === "number"
                  ? result.payload.exp
                  : undefined;
              const iat =
                typeof result.payload.iat === "number"
                  ? result.payload.iat
                  : undefined;
              const isExpired = exp && Date.now() >= exp * 1000;
              const borderColor = isExpired
                ? "border-red-500"
                : "border-green-500";
              return (
                <div className="flex flex-col mb-2">
                  <h3 className="text-lg font-bold mb-2">Token Info</h3>
                  <div
                    className={`bg-card p-4 rounded-lg shadow-md border ${borderColor} text-foreground`}
                  >
                    <ul className="text-[15px]">
                      {iat && (
                        <li>
                          <b className="text-primary">Ausgestellt am:</b>{" "}
                          <span className="text-muted-foreground">
                            {new Date(iat * 1000).toLocaleString()}
                          </span>
                        </li>
                      )}
                      {exp && (
                        <>
                          <li>
                            <b className="text-primary">Status:</b>{" "}
                            {Date.now() < exp * 1000 ? (
                              <span className="text-green-400">✅ Gültig</span>
                            ) : (
                              <span className="text-red-400">
                                ❌ Abgelaufen
                              </span>
                            )}
                          </li>
                          <li>
                            <b className="text-primary">Läuft ab am:</b>{" "}
                            <span className="text-muted-foreground">
                              {new Date(exp * 1000).toLocaleString()}
                            </span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })()}
        </div>
        {/* Rechte Spalte: Ergebnisse */}
        <div className="flex flex-col gap-6 w-[50%] h-full overflow-y-auto pr-8">
          {/* Decoded Header Section */}
          <div className="flex flex-col mb-2">
            <h3 className="text-lg font-bold text-primary mb-2">
              Decoded Header
            </h3>
            <CopyBlock
              text={
                isDecodedJWT(result)
                  ? JSON.stringify(result.header, null, 2)
                  : ""
              }
              copyToast="Header wurde in die Zwischenablage kopiert!"
              className=""
            >
              {isDecodedJWT(result) && result.header ? (
                <JsonWithTooltips
                  data={result.header}
                  colorKey="text-blue-400"
                />
              ) : (
                <span className="text-muted-foreground"> </span>
              )}
            </CopyBlock>
          </div>

          {/* Decoded Payload Section */}
          <div className="flex flex-col mb-2">
            <h3 className="text-lg font-bold mb-2">Decoded Payload</h3>
            <CopyBlock
              text={
                isDecodedJWT(result)
                  ? JSON.stringify(result.payload, null, 2)
                  : ""
              }
              copyToast="Payload wurde in die Zwischenablage kopiert!"
              className=""
            >
              {isDecodedJWT(result) && result.payload ? (
                <JsonWithTooltips
                  data={result.payload}
                  colorKey="text-blue-400"
                />
              ) : (
                <span className="text-muted-foreground"> </span>
              )}
            </CopyBlock>
          </div>

          {/* JWT Signature Verification (Optional) Section */}
          <div className="flex flex-col mb-2">
            <h3 className="text-lg font-bold text-foreground mb-2">
              JWT Signature Verification{" "}
              <span className="font-normal text-sm text-muted-foreground">
                (Optional)
              </span>
            </h3>
            <CopyBlock
              text={isDecodedJWT(result) ? result.signature : ""}
              copyToast="Signature wurde in die Zwischenablage kopiert!"
              className=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWTDecoder;
