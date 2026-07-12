"use client";

import { Database } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "ui";
import { Admonition } from "ui-patterns/admonition";
import { EmptyStatePresentational } from "ui-patterns/EmptyStatePresentational";

function LibrarySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-16 border-b border-[var(--tool-chrome-border)] pb-16 last:mb-0 last:border-b-0 last:pb-0">
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--tool-chrome-text-heading)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">{children}</div>
  );
}

function PreviewBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="self-start w-full">
      <h3 className="text-foreground mb-4 text-sm font-medium">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function PreviewStack({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="self-start w-full">
      <h3 className="text-foreground mb-4 text-sm font-medium">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function ComponentLibraryContent() {
  const [tab, setTab] = useState<"tables" | "functions" | "replicas">("tables");

  return (
    <div className="pb-20">
      <LibrarySection
        title="ui — Base primitives (Supabase Light)"
        description="Synced from packages/ui. Previews use the Supabase Light theme — the default for all prototypes in this host."
      >
        <PreviewGrid>
          <PreviewBlock title="Button variants">
            <Button variant="primary">Primary</Button>
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="dashed">Dashed</Button>
            <Button variant="text">Text</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </PreviewBlock>

          <PreviewBlock title="Badge variants">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </PreviewBlock>

          <PreviewStack title="Form controls">
            <div className="grid max-w-md gap-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input id="demo-email" placeholder="you@example.com" />
            </div>
            <div className="grid max-w-md gap-2">
              <Label htmlFor="demo-notes">Notes</Label>
              <Textarea id="demo-notes" placeholder="Add context…" />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="demo-check" defaultChecked />
              <Label htmlFor="demo-check">Enable row level security</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="demo-switch" defaultChecked />
              <Label htmlFor="demo-switch">Realtime enabled</Label>
            </div>
          </PreviewStack>

          <PreviewStack title="Switch sizes">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch id="demo-switch-small" size="small" />
                <Label htmlFor="demo-switch-small">Small</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="demo-switch-medium" size="medium" defaultChecked />
                <Label htmlFor="demo-switch-medium">Medium (default)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="demo-switch-large" size="large" />
                <Label htmlFor="demo-switch-large">Large</Label>
              </div>
            </div>
          </PreviewStack>

          <PreviewStack title="Card">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Database</CardTitle>
                <CardDescription>
                  Shared card primitive from the synced Supabase design system.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-foreground-light text-sm">
                Postgres 15 · us-east-1 · Active
              </CardContent>
              <CardFooter>
                <Button variant="default" size="tiny">
                  View settings
                </Button>
              </CardFooter>
            </Card>
          </PreviewStack>

          <PreviewStack title="Tabs">
            <Tabs
              value={tab}
              onValueChange={(value) =>
                setTab(value as "tables" | "functions" | "replicas")
              }
              className="max-w-md"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="functions">Functions</TabsTrigger>
                <TabsTrigger value="replicas">Replicas</TabsTrigger>
              </TabsList>
              <TabsContent value="tables" className="text-sm">
                Browse and edit table data.
              </TabsContent>
              <TabsContent value="functions" className="text-sm">
                Edge functions deployed to your project.
              </TabsContent>
              <TabsContent value="replicas" className="text-sm">
                Read replicas for query scaling.
              </TabsContent>
            </Tabs>
          </PreviewStack>

          <PreviewStack title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm migration</DialogTitle>
                  <DialogDescription>
                    Dialog content synced from ui with backdrop and focus trap.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="default">Cancel</Button>
                  <Button variant="primary">Apply migration</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PreviewStack>

          <PreviewBlock title="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Supabase tooltip</TooltipContent>
            </Tooltip>
          </PreviewBlock>

          <PreviewBlock title="Alert">
            <Alert className="max-w-md">
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                You can enable replication from project settings.
              </AlertDescription>
            </Alert>
          </PreviewBlock>

          <PreviewBlock title="Separator">
            <div className="flex w-full max-w-md items-center gap-4">
              <span className="text-foreground-light text-sm">Before</span>
              <Separator className="flex-1" />
              <span className="text-foreground-light text-sm">After</span>
            </div>
          </PreviewBlock>
        </PreviewGrid>
      </LibrarySection>

      <LibrarySection
        title="ui-patterns — Composite components"
        description="Synced from packages/ui-patterns. Reusable patterns used across Studio surfaces."
      >
        <PreviewGrid>
          <PreviewStack title="Admonition">
            <Admonition
              type="note"
              title="OAuth Server is disabled"
              description="Enable OAuth Server to make your project act as an identity provider for third-party applications."
              actions={<Button variant="default">OAuth Server settings</Button>}
            />
            <Admonition
              type="warning"
              title="Deprecation notice"
              description="This API will be removed in a future release."
            />
            <Admonition
              type="destructive"
              title="Action required"
              description="Your project is over the included egress limit."
            />
          </PreviewStack>

          <PreviewStack title="Empty state">
            <EmptyStatePresentational
              icon={Database}
              title="No backups yet"
              description="Check again tomorrow or create a manual backup from project settings."
            >
              <Button variant="primary">Create backup</Button>
            </EmptyStatePresentational>
          </PreviewStack>
        </PreviewGrid>
      </LibrarySection>

      <LibrarySection
        title="Design tokens"
        description="Semantic colors from packages/config and packages/ui/build (Supabase Light)."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Studio",
              className: "bg-studio text-foreground border-default border",
            },
            {
              label: "Surface 100",
              className: "bg-surface-100 text-foreground border-default border",
            },
            {
              label: "Selection",
              className: "bg-selection text-foreground border-default border",
            },
            {
              label: "Brand",
              className: "bg-brand text-brand-600 border-brand border",
            },
            {
              label: "Warning",
              className:
                "bg-warning/10 text-warning border-border-warning border",
            },
            {
              label: "Destructive",
              className:
                "bg-destructive/10 text-destructive border-border-destructive border",
            },
            {
              label: "Foreground",
              className: "bg-foreground text-background border-default border",
            },
            {
              label: "Alternative",
              className: "bg-alternative text-foreground border-default border",
            },
          ].map((swatch) => (
            <div
              key={swatch.label}
              className={`rounded-lg p-4 text-sm font-medium ${swatch.className}`}
            >
              {swatch.label}
            </div>
          ))}
        </div>
      </LibrarySection>
    </div>
  );
}
