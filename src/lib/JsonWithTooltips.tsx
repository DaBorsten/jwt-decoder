import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { tooltipTextForKey } from "../lib/jwtDescriptions";
import { useTranslation } from "react-i18next";

interface JsonWithTooltipsProps {
  data: Record<string, unknown>;
  colorKey: string;
}

const JsonWithTooltips: React.FC<JsonWithTooltipsProps> = ({
  data,
  colorKey,
}) => {
  const { t } = useTranslation();
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
          // Try to detect the raw value after the first colon
          const valueMatch = after.match(/:\s*(.+?)(,)?$/);
          let valuePortion = after;
          let valueNode: React.ReactNode = null;
          if (valueMatch) {
            const rawValue = (valueMatch[1] ?? "").trim();
            // Check whether it's a plain 10-digit number
            if (/^\d{10}$/.test(rawValue)) {
              const num = parseInt(rawValue, 10);
              const date = new Date(num * 1000);
              const locale = date.toLocaleString();
              const iso = date.toISOString();
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
              // Replace the first occurrence of the number in the 'after' string with a placeholder
              const prefix = after.slice(0, after.indexOf(rawValue));
              const suffix = after.slice(
                after.indexOf(rawValue) + rawValue.length,
              );
              valuePortion = prefix; // remainder (suffix) will be appended after the node
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
                        <b>{t("jwt.local_time")}</b> {locale}
                      </div>
                      <div>
                        <b>{t("jwt.iso")}</b> {iso}
                      </div>
                      <div>
                        <b>{t("jwt.timezone")}</b> {tz}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
              // append suffix after the value node
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
          // Highlight values + show tooltips for 10-digit Unix seconds
          // Split instead of piping everything through replace so we can render tooltips for individual numeric tokens.
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
                        <b>{t("jwt.local_time")}</b> {locale}
                      </div>
                      <div>
                        <b>{t("jwt.iso")}</b> {iso}
                      </div>
                      <div>
                        <b>{t("jwt.timezone")}</b> {tz}
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

// Helper to highlight strings/booleans/null in fragments with colors
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
