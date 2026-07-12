import { ChevronDown } from "lucide-react";
import { Button, cn } from "ui";

export function TopSection() {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-1 gap-8 py-0 w-full items-center">
        <div className="flex flex-col">
          <div className="flex flex-row flex-wrap items-center gap-4 w-full">
            <div>
              <div className="flex items-center gap-x-2">
                <h1 className="text-3xl">Default Project</h1>
              </div>
              <div className="mt-3 inline-flex max-w-full items-center gap-3 min-w-0">
                <span className="min-w-0 max-w-[320px] truncate text-left text-foreground-light">
                  http://127.0.0.1:54321
                </span>
                <Button
                  variant="default"
                  size="tiny"
                  className="shrink-0"
                  iconRight={
                    <ChevronDown size={14} className={cn("transition-transform")} />
                  }
                >
                  Copy <span className="sr-only">project URL and API keys</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
