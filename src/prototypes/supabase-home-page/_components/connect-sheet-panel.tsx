import { Box, Cable, Copy, Database, Server, Sparkles } from "lucide-react";
import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { type ReactNode } from "react";
import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
} from "ui";
import { Admonition } from "ui-patterns/admonition";

import { MOCK_PROJECT } from "./supabase-home-page-mock-data";
import type { ConnectSheetMode } from "./supabase-home-page-types";

type OpenConnectMode = Exclude<ConnectSheetMode, "none">;

type ConnectSheetPanelProps = {
  connectSheet: ConnectSheetMode;
  onClose: () => void;
  onModeChange: (mode: OpenConnectMode) => void;
};

const CONNECT_MODES: {
  id: OpenConnectMode;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: "framework",
    label: "Framework",
    description: "Use a client library",
    icon: <Box size={16} strokeWidth={1.5} />,
  },
  {
    id: "server",
    label: "Server",
    description: "Build APIs",
    icon: <Server size={16} strokeWidth={1.5} />,
  },
  {
    id: "direct",
    label: "Direct",
    description: "Connection string",
    icon: <Database size={16} strokeWidth={1.5} />,
  },
  {
    id: "orm",
    label: "ORM",
    description: "Third-party library",
    icon: <Cable size={16} strokeWidth={1.5} />,
  },
  {
    id: "mcp",
    label: "MCP",
    description: "Connect your agent",
    icon: <Sparkles size={16} strokeWidth={1.5} />,
  },
];

function ConnectSheetStep({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="group" data-connect-step>
      <div className="flex items-start gap-6 self-stretch">
        <div className="relative self-stretch shrink-0 w-6">
          <div className="absolute inset-0 flex items-start justify-center">
            <div
              aria-hidden="true"
              className={cn(
                "absolute left-[calc(50%-1px)] w-px bg-border opacity-60 h-full",
                "group-last:bg-transparent",
              )}
            />
            <div className="relative z-10 flex font-mono text-xs items-center justify-center min-w-6 w-6 h-6 border border-default rounded-md bg-surface-100 text-foreground-light">
              {number}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 2xl:grid-cols-5 gap-x-6 gap-y-4 pb-12 w-full">
          <div className="flex flex-col 2xl:col-span-2">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-sm text-foreground-light">{description}</p>
          </div>
          <div className="2xl:col-span-3" data-step-content>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameworkConfig() {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-6">
        <p className="text-sm text-foreground">Framework</p>
        <Select defaultValue="nextjs">
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextjs">Next.js</SelectItem>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-6">
        <p className="text-sm text-foreground">Using</p>
        <Select defaultValue="app">
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="app">App Router</SelectItem>
            <SelectItem value="pages">Pages Router</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-sm text-foreground">Shadcn</p>
          <p className="text-sm text-foreground-lighter">
            Install components via the Supabase shadcn registry.
          </p>
        </div>
        <Switch checked={false} aria-label="Install shadcn components" />
      </div>
    </div>
  );
}

function CopyPromptCard() {
  return (
    <Admonition
      type="tip"
      showIcon={false}
      layout="horizontal"
      className="relative overflow-hidden"
      actions={
        <Button type="button" variant="default" size="tiny" icon={<Copy size={14} />}>
          Copy prompt
        </Button>
      }
    >
      <div className="absolute -inset-16 z-0 opacity-50">
        <img
          alt=""
          className="w-full h-full object-cover object-right hidden dark:block"
          src="/img/reports/bg-grafana-dark.svg"
        />
        <img
          alt=""
          className="w-full h-full object-cover object-right dark:hidden"
          src="/img/reports/bg-grafana-light.svg"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background-alternative to-transparent" />
      </div>
      <div className="relative flex flex-col md:flex-row md:items-center gap-y-2 md:gap-x-8 justify-between">
        <p className="heading-default">Give your agent everything it needs</p>
      </div>
    </Admonition>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="font-mono text-sm rounded-md border border-default bg-surface-100 p-4 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function ConnectSteps({ mode }: { mode: OpenConnectMode }) {
  if (mode === "framework") {
    return (
      <>
        <ConnectSheetStep
          number={1}
          title="Install packages"
          description="Run this command to install the required dependencies."
        >
          <CodeBlock>npm install @supabase/supabase-js @supabase/ssr</CodeBlock>
        </ConnectSheetStep>
        <ConnectSheetStep
          number={2}
          title="Add files"
          description="Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed."
        >
          <CodeBlock>{`import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  '${MOCK_PROJECT.apiUrl}',
  '${MOCK_PROJECT.anonKey}'
)`}</CodeBlock>
        </ConnectSheetStep>
      </>
    );
  }

  if (mode === "server") {
    return (
      <ConnectSheetStep
        number={1}
        title="Create a client"
        description="Use the project URL and anon key from your local stack."
      >
        <CodeBlock>{`const supabase = createClient(
  '${MOCK_PROJECT.apiUrl}',
  '${MOCK_PROJECT.anonKey}'
)`}</CodeBlock>
      </ConnectSheetStep>
    );
  }

  if (mode === "direct") {
    return (
      <ConnectSheetStep
        number={1}
        title="Connection string"
        description="Connect directly to your local Postgres instance."
      >
        <CodeBlock>postgresql://postgres:postgres@127.0.0.1:54322/postgres</CodeBlock>
      </ConnectSheetStep>
    );
  }

  if (mode === "orm") {
    return (
      <ConnectSheetStep
        number={1}
        title="Prisma datasource"
        description="Point your ORM at the local database URL."
      >
        <CodeBlock>DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"</CodeBlock>
      </ConnectSheetStep>
    );
  }

  return (
    <ConnectSheetStep
      number={1}
      title="MCP server"
      description="Connect your agent to this local project."
    >
      <CodeBlock>{`{
  "mcpServers": {
    "supabase": {
      "url": "${MOCK_PROJECT.apiUrl}"
    }
  }
}`}</CodeBlock>
    </ConnectSheetStep>
  );
}

export function ConnectSheetPanel({
  connectSheet,
  onClose,
  onModeChange,
}: ConnectSheetPanelProps) {
  const portalContainer = usePrototypeProductOverlayPortal();
  const visible = connectSheet !== "none";
  const selectedMode: OpenConnectMode =
    connectSheet === "none" ? "framework" : connectSheet;

  return (
    <PrototypeComponent id="connect-sheet-panel">
      <Sheet
        open={visible}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        modal={false}
      >
        <SheetContent
          size="lg"
          portalContainer={portalContainer}
          className="flex flex-col gap-0 p-0 space-y-0"
          tabIndex={undefined}
        >
          <SheetHeader className="text-left border-b shrink-0 py-6 px-8">
            <SheetTitle>Connect to your project</SheetTitle>
            <SheetDescription>Choose how you want to use Supabase</SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-y-auto divide-y">
            <div className="p-8">
              <div
                className="grid rounded-lg border overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${CONNECT_MODES.length}, minmax(0, 1fr))` }}
              >
                {CONNECT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onModeChange(mode.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 transition-colors border-r last:border-r-0",
                      selectedMode === mode.id
                        ? "bg-surface-200"
                        : "border-default hover:border-strong hover:bg-surface-100",
                    )}
                  >
                    <span className="text-foreground-light">{mode.icon}</span>
                    <div>
                      <p className="heading-default text-center">{mode.label}</p>
                      <p className="text-sm text-foreground-lighter text-center">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMode === "framework" ? (
              <div className="border-b p-8">
                <FrameworkConfig />
              </div>
            ) : null}

            <div className="p-8 flex flex-col gap-6">
              {selectedMode === "framework" ? <CopyPromptCard /> : null}
              <ConnectSteps mode={selectedMode} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PrototypeComponent>
  );
}
