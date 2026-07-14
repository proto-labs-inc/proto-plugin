import { cn } from "@prototype/lib/utils";

type CodeBlockProps = {
  children: string;
  compact?: boolean;
  className?: string;
};

export function CodeBlock({ children, compact = false, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "overflow-auto whitespace-pre-wrap rounded-md bg-muted font-mono text-muted-foreground",
        compact ? "max-h-48 p-2 text-[13px] leading-relaxed" : "max-h-64 p-3 text-sm leading-relaxed",
        className,
      )}
    >
      {children}
    </pre>
  );
}
