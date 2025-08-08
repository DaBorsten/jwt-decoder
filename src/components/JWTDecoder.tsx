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

  function isDecodedJWT(
    r: JWTResult,
  ): r is {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
  } {
    return !!r && "header" in r && "payload" in r && "signature" in r;
  }
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
    <div className="w-full h-screen min-h-screen flex items-stretch justify-center bg-background dark px-2 py-8">
      <div className="w-full max-w-6xl bg-card rounded-2xl shadow-2xl py-8 pl-8 flex flex-row gap-8 border border-border h-full">
        {/* Linke Spalte: Eingabe */}
        <div className="flex flex-col gap-6 w-[40%] h-full">
          <div className="flex flex-col mb-2 h-full">
            <h3 className="text-lg font-bold text-primary mb-2">JWT Token</h3>
            <textarea
              id="jwt-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="JWT Token hier eingeben..."
              className="w-full flex-1 min-h-0 bg-background border-2 border-dashed border-border rounded-lg p-4 text-base text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
              style={{ boxShadow: "0 1px 4px #0002", height: "100%" }}
            />
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
                      {exp && (
                        <li>
                          <b className="text-primary">Läuft ab am:</b>{" "}
                          <span className="text-muted-foreground">
                            {new Date(exp * 1000).toLocaleString()}
                          </span>
                          <br />
                          <b className="text-primary">Status:</b>{" "}
                          {Date.now() < exp * 1000 ? (
                            <span className="text-green-400">✅ Gültig</span>
                          ) : (
                            <span className="text-red-400">❌ Abgelaufen</span>
                          )}
                        </li>
                      )}
                      {iat && (
                        <li>
                          <b className="text-primary">Ausgestellt am:</b>{" "}
                          <span className="text-muted-foreground">
                            {new Date(iat * 1000).toLocaleString()}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })()}
        </div>
        {/* Rechte Spalte: Ergebnisse */}
        <div className="flex flex-col gap-6 w-[60%] h-full overflow-y-auto pr-8">
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
