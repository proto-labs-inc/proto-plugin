import { Shield } from "lucide-react";
import {
  AiIconAnimation,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "ui";

export function AdvisorSection() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Advisor found 1 issue</h2>
        <Button variant="default" icon={<AiIconAnimation />}>
          Ask Assistant
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card
          className={cn(
            "min-h-full flex flex-col items-stretch cursor-pointer h-64",
            "bg-destructive-200 border-destructive-400",
          )}
        >
          <CardHeader className="border-b-0 shrink-0 flex flex-row gap-2 space-y-0 justify-between items-center">
            <div className="flex flex-row items-center gap-3">
              <Shield
                size={16}
                strokeWidth={1.5}
                className="text-destructive-600"
              />
              <CardTitle className="text-foreground-light">SECURITY</CardTitle>
            </div>
            <Badge variant="destructive" className="w-fit">
              CRITICAL
            </Badge>
          </CardHeader>
          <CardContent className="p-6 pt-16 flex flex-col justify-end flex-1 overflow-auto">
            <h3 className="mb-1">RLS Disabled in Public</h3>
            <p className="leading-6 text-sm text-foreground-light">
              Table <code className="text-xs">public.employees</code> is public, but RLS has not
              been enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
