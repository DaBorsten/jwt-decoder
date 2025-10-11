import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { tooltipTextForKey } from "../lib/jwtDescriptions";

interface JsonWithTooltipsProps {
  data: Record<string, unknown>;
  colorKey: string;
}

const JsonWithTooltips: React.FC<JsonWithTooltipsProps> = ({
  data,
  colorKey,
}) => {
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
          // Versuchen den Wert hinter dem ersten Doppelpunkt zu erkennen (roh)
          const valueMatch = after.match(/:\s*(.+?)(,)?$/);
          let valuePortion = after;
          let valueNode: React.ReactNode = null;
          if (valueMatch) {
            const rawValue = (valueMatch[1] ?? "").trim();
            // Prüfen ob reine 10-stellige Zahl
            if (/^\d{10}$/.test(rawValue)) {
              const num = parseInt(rawValue, 10);
              const date = new Date(num * 1000);
              const locale = date.toLocaleString();
              const iso = date.toISOString();
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
              // Ersetze im after-String das erste Auftreten der Zahl durch Platzhalter
              const prefix = after.slice(0, after.indexOf(rawValue));
              const suffix = after.slice(
                after.indexOf(rawValue) + rawValue.length,
              );
              valuePortion = prefix; // Rest (suffix) wird nach dem Node angefügt
              valueNode = (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-orange-400 underline cursor-help font-mono"
                      style={{
                        textUnderlineOffset: "5px",
                        textDecorationThickness: "1.5px",
                        textDecorationStyle: "dashed",
                      }}
                    >
                      {rawValue}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm leading-snug">
                      <div>
                        <b>Lokale Zeit:</b> {locale}
                      </div>
                      <div>
                        <b>ISO:</b> {iso}
                      </div>
                      <div>
                        <b>Zeitzone:</b> {tz}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
              // suffix anhängen nach valueNode
              return (
                <div
                  key={i}
                  style={{ whiteSpace: "pre" }}
                  className={`
                    transition-colors
                    hover:text-blue-200
                    hover:bg-blue-950/40
                  `}
                >
                  {before}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`${
                          colorKey ?? ""
                        } font-semibold cursor-pointer`}
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
                  {valuePortion}
                  {valueNode}
                  {suffix}
                </div>
              );
            }
          }
          return (
            <div
              key={i}
              style={{ whiteSpace: "pre" }}
              className={`
                transition-colors
                hover:text-blue-200
                hover:bg-blue-950/40
              `}
            >
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
          // Werte hervorheben + 10-stellige Unix-Sekunden mit Tooltip
          // Zerlegen statt alles via replace zu pipen, damit wir Tooltips für einzelne number tokens rendern können.
          const numberTokenRegex = /(\d{1,})/g;
          const segments: React.ReactNode[] = [];
          let lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = numberTokenRegex.exec(line)) !== null) {
            const [full] = m;
            const start = m.index;
            const end = start + full.length;
            if (start > lastIndex) {
              segments.push(
                renderValueFragment(
                  line.slice(lastIndex, start),
                  `fragment-${lastIndex}-${start}`,
                ),
              );
            }
            const isTenDigit = /^\d{10}$/.test(full);
            if (isTenDigit) {
              const ts = parseInt(full, 10) * 1000;
              const date = new Date(ts);
              const locale = date.toLocaleString();
              const iso = date.toISOString();
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
              segments.push(
                <Tooltip key={start}>
                  <TooltipTrigger asChild>
                    <span
                      className="text-orange-400 underline cursor-help"
                      style={{
                        textUnderlineOffset: "5px",
                        textDecorationThickness: "2px",
                        textDecorationStyle: "dashed",
                      }}
                    >
                      {full}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm leading-snug">
                      <div>
                        <b>Lokale Zeit:</b> {locale}
                      </div>
                      <div>
                        <b>ISO:</b> {iso}
                      </div>
                      <div>
                        <b>Zeitzone:</b> {tz}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>,
              );
            } else {
              segments.push(
                <span key={start} className="text-orange-400">
                  {full}
                </span>,
              );
            }
            lastIndex = end;
          }
          if (lastIndex < line.length) {
            segments.push(
              renderValueFragment(
                line.slice(lastIndex),
                `fragment-${lastIndex}-end`,
              ),
            );
          }
          return (
            <div
              key={i}
              style={{ whiteSpace: "pre" }}
              className={`
                transition-colors
                hover:text-blue-200
                hover:bg-blue-950/40
              `}
            >
              {segments}
            </div>
          );
        }
      })}
    </code>
  );
};

// Hilfsfunktion um Strings/Booleans/Null farbig in Fragmenten zu highlighten
function renderValueFragment(fragment: string, key: string): React.ReactNode {
  let formatted = fragment;
  // Strings
  formatted = formatted.replace(
    /(: )("[^"]*")/g,
    '$1<span class="text-green-400">$2</span>',
  );
  // Booleans
  formatted = formatted.replace(
    /(: )(true|false)/g,
    '$1<span class="text-purple-400">$2</span>',
  );
  // null
  formatted = formatted.replace(
    /(: )(null)/g,
    '$1<span class="text-gray-400">$2</span>',
  );
  return <span key={key} dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export default JsonWithTooltips;
