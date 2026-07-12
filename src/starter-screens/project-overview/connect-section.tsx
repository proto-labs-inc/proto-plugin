import {
  Box,
  Cable,
  ChevronRight,
  Database,
  KeyRound,
  Server,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, cn } from "ui";

const CONNECT_ACTIONS = [
  {
    id: "framework",
    heading: "Framework",
    subheading: "Use a client library",
    icon: <Box size={16} strokeWidth={1.5} />,
  },
  {
    id: "server",
    heading: "Server",
    subheading: "Build APIs",
    icon: <Server size={16} strokeWidth={1.5} />,
  },
  {
    id: "direct",
    heading: "Direct",
    subheading: "Connection string",
    icon: <Database size={16} strokeWidth={1.5} />,
  },
  {
    id: "orm",
    heading: "ORM",
    subheading: "Third-party library",
    icon: <Cable size={16} strokeWidth={1.5} />,
  },
  {
    id: "mcp",
    heading: "MCP",
    subheading: "Connect your agent",
    icon: <Sparkles size={16} strokeWidth={1.5} />,
  },
  {
    id: "api_keys",
    heading: "API Keys",
    subheading: "Manage project keys",
    icon: <KeyRound size={16} strokeWidth={1.5} />,
  },
] as const;

export function ConnectSection() {
  return (
    <section className="w-full">
      <div className="mb-6">
        <h3 className="heading-section">Get connected</h3>
      </div>

      <Card className="bg-background/25 border-dashed relative overflow-hidden">
        <div className="absolute -inset-16 z-0 opacity-50">
          <img
            src="/img/reports/bg-grafana-light.svg"
            alt=""
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background-alternative to-transparent" />
        </div>

        <CardContent className="relative z-10 p-0">
          <div className="grid grid-cols-1 xl:grid-cols-6 divide-y xl:divide-y-0 xl:divide-x border-muted">
            {CONNECT_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className={cn(
                  "group flex items-center gap-3 p-4 text-left transition-colors min-h-[72px] w-full",
                  "hover:bg-surface-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand",
                  "xl:min-h-32 xl:flex-col xl:justify-center xl:p-6 xl:text-center",
                )}
              >
                <span className="shrink-0 text-foreground-light group-hover:text-foreground">
                  {action.icon}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1 xl:flex-initial">
                  <p className="text-sm">{action.heading}</p>
                  <p className="text-sm text-foreground-lighter">{action.subheading}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-foreground-lighter group-hover:text-foreground xl:hidden"
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
