import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CopyBlockProps {
  text: string;
  copyToast?: string;
  className?: string;
  children?: React.ReactNode;
}

const CopyBlock: React.FC<CopyBlockProps> = ({
  text,
  copyToast = "In die Zwischenablage kopiert!",
  className = "",
  children,
}) => {
  return (
    <section
      className={`relative bg-background border border-border rounded-xl shadow-md overflow-hidden transition-colors group ${className}`}
    >
      <div className="border-b border-border p-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="transition-colors hover:border-gray-500 hover:text-primary cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success(copyToast);
          }}
        >
          Copy
        </Button>
      </div>
      <pre className="bg-background m-4 overflow-x-auto text-[15px] font-mono shadow-md min-h-[80px]">
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
    </section>
  );
};

export default CopyBlock;
