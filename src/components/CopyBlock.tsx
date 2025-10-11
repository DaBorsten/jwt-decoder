import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CopyBlockProps {
  text: string;
  copyToast?: string;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
  labelledById?: string;
}

const CopyBlock: React.FC<CopyBlockProps> = ({
  text,
  copyToast,
  className = "",
  children,
  ariaLabel,
  labelledById,
}) => {
  const { t } = useTranslation();
  const toastText = copyToast ?? t("common.copied");
  const srId = React.useId();
  return (
    <section
      role="region"
      aria-label={ariaLabel}
      aria-labelledby={labelledById}
      className={`relative bg-background border border-border rounded-xl shadow-md overflow-hidden transition-colors group focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      <div className="border-b border-border p-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="transition-colors hover:border-gray-500 hover:text-primary cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success(toastText);
          }}
          aria-label={ariaLabel ? `${t("common.copy")} ${ariaLabel}` : t("common.copy")}
        >
          {t("common.copy")}
        </Button>
      </div>
      <pre
        className="bg-background m-4 overflow-x-auto text-[15px] font-mono shadow-md min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
        tabIndex={0}
        aria-labelledby={labelledById}
        aria-describedby={srId}
      >
        {children
          ? children
          : text.split("\n").map((line, idx) => (
              <div
                key={idx}
                className={`
                transition-colors
                hover:text-blue-200
                hover:bg-blue-950/40
              `}
              >
                {line || "\u00A0"}
              </div>
            ))}
      </pre>
      {/* Screen-reader accessible plain text content used by aria-describedby */}
      <div id={srId} className="sr-only" aria-hidden={false}>
        {text}
      </div>
    </section>
  );
};

export default CopyBlock;
