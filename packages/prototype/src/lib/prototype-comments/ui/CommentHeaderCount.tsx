import { cn } from "@prototype/lib/utils";

type CommentHeaderCountProps = {
  unresolved: number;
  total: number;
  className?: string;
};

export function CommentHeaderCount({
  unresolved,
  total,
  className,
}: CommentHeaderCountProps) {
  if (total === 0) return null;

  const base = cn("ml-1.5 tabular-nums", className);

  if (unresolved === total) {
    return <span className={cn(base, "text-foreground")}>{total}</span>;
  }

  return (
    <span className={cn(base, "text-foreground")}>
      {unresolved}
      <span className="text-muted-foreground"> / {total}</span>
    </span>
  );
}
