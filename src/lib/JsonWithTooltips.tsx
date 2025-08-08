import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { tooltipTextForKey } from "../lib/jwtDescriptions";

interface JsonWithTooltipsProps {
  data: Record<string, unknown>;
  colorKey: string;
}

const JsonWithTooltips: React.FC<JsonWithTooltipsProps> = ({ data, colorKey }) => {
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
          // Highlight values: numbers, strings, booleans, null
          const highlighted = line
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
              className={`
                transition-colors
                hover:text-blue-200
                hover:bg-blue-950/40
              `}
            />
          );
        }
      })}
    </code>
  );
};

export default JsonWithTooltips;
