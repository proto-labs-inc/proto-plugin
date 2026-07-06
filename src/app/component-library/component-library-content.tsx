"use client";

import { ArrowButton } from "@calcom/ui/components/arrow-button";
import { Badge as CalBadge } from "@calcom/ui/components/badge";
import { Button as CalButton } from "@calcom/ui/components/button";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { Divider } from "@calcom/ui/components/divider";
import { SegmentedControl } from "@calcom/ui/components/segmented-control";
import { Badge as CossBadge } from "@coss/ui/components/badge";
import { Button as CossButton } from "@coss/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@coss/ui/components/card";
import { Checkbox } from "@coss/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@coss/ui/components/dialog";
import { Input } from "@coss/ui/components/input";
import { Label } from "@coss/ui/components/label";
import { Separator } from "@coss/ui/components/separator";
import { Switch } from "@coss/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@coss/ui/components/tabs";
import { Textarea } from "@coss/ui/components/textarea";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@coss/ui/components/tooltip";
import { useState, type ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

const SOURCE_SURFACE_ATTRS = {
  "data-prototype-source-surface": true,
  "data-cal-design-system": true,
} as const;

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
    <div
      {...SOURCE_SURFACE_ATTRS}
      className="border-subtle bg-default self-start rounded-xl border p-6"
    >
      <h3 className="text-emphasis mb-4 text-sm font-medium">{title}</h3>
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
    <div
      {...SOURCE_SURFACE_ATTRS}
      className="border-subtle bg-default self-start rounded-xl border p-6"
    >
      <h3 className="text-emphasis mb-4 text-sm font-medium">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function ComponentLibraryContent() {
  const [segment, setSegment] = useState<"day" | "week" | "month">("week");

  return (
    <RadixTooltip.Provider>
      <TooltipProvider>
      <div className="pb-20">
        <LibrarySection
          title="@coss/ui — Base primitives"
          description="Synced from packages/coss-ui. Shadcn-style building blocks used in newer Cal.com surfaces."
        >
          <PreviewGrid>
            <PreviewBlock title="Button variants">
              <CossButton>Default</CossButton>
              <CossButton variant="secondary">Secondary</CossButton>
              <CossButton variant="outline">Outline</CossButton>
              <CossButton variant="ghost">Ghost</CossButton>
              <CossButton variant="destructive">Destructive</CossButton>
              <CossButton size="sm">Small</CossButton>
              <CossButton size="lg">Large</CossButton>
              <CossButton disabled>Disabled</CossButton>
            </PreviewBlock>

            <PreviewBlock title="Badge variants">
              <CossBadge>Default</CossBadge>
              <CossBadge variant="secondary">Secondary</CossBadge>
              <CossBadge variant="outline">Outline</CossBadge>
              <CossBadge variant="success">Success</CossBadge>
              <CossBadge variant="warning">Warning</CossBadge>
              <CossBadge variant="destructive">Destructive</CossBadge>
              <CossBadge variant="info">Info</CossBadge>
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
                <Label htmlFor="demo-check">Remember this choice</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="demo-switch" defaultChecked />
                <Label htmlFor="demo-switch">Enable notifications</Label>
              </div>
            </PreviewStack>

            <PreviewStack title="Card">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Event type</CardTitle>
                  <CardDescription>
                    Shared card primitive from the synced design system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  30 min · Google Meet · Public
                </CardContent>
                <CardFooter>
                  <CossButton size="sm">Edit</CossButton>
                </CardFooter>
              </Card>
            </PreviewStack>

            <PreviewStack title="Tabs">
              <Tabs defaultValue="upcoming" className="max-w-md">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="text-sm !flex-none">
                  No upcoming bookings in this preview state.
                </TabsContent>
                <TabsContent value="past" className="text-sm !flex-none">
                  Past bookings would appear here.
                </TabsContent>
                <TabsContent value="cancelled" className="text-sm !flex-none">
                  Cancelled bookings would appear here.
                </TabsContent>
              </Tabs>
            </PreviewStack>

            <PreviewStack title="Dialog">
              <Dialog>
                <DialogTrigger>
                  <CossButton variant="outline">Open dialog</CossButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm change</DialogTitle>
                    <DialogDescription>
                      Dialog content synced from @coss/ui with backdrop and
                      focus trap.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose>
                      <CossButton variant="outline">Cancel</CossButton>
                    </DialogClose>
                    <CossButton>Save</CossButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </PreviewStack>

            <PreviewBlock title="Tooltip">
              <Tooltip>
                <TooltipTrigger>
                  <CossButton variant="outline">Hover me</CossButton>
                </TooltipTrigger>
                <TooltipPopup>Coss tooltip</TooltipPopup>
              </Tooltip>
            </PreviewBlock>

            <PreviewBlock title="Separator">
              <div className="flex w-full max-w-md items-center gap-4">
                <span className="text-sm">Before</span>
                <Separator className="flex-1" />
                <span className="text-sm">After</span>
              </div>
            </PreviewBlock>
          </PreviewGrid>
        </LibrarySection>

        <LibrarySection
          title="@calcom/ui — Product components"
          description="Synced from packages/ui. Branded Cal.com controls used across booking, settings, and event-type surfaces."
        >
          <PreviewGrid>
            <PreviewBlock title="Button colors">
              <CalButton color="primary">Primary</CalButton>
              <CalButton color="secondary">Secondary</CalButton>
              <CalButton color="minimal">Minimal</CalButton>
              <CalButton color="destructive">Destructive</CalButton>
              <CalButton StartIcon="plus">With icon</CalButton>
              <CalButton loading>Loading</CalButton>
              <CalButton disabled>Disabled</CalButton>
            </PreviewBlock>

            <PreviewBlock title="Badge variants">
              <CalBadge variant="gray">Gray</CalBadge>
              <CalBadge variant="green">Green</CalBadge>
              <CalBadge variant="red">Red</CalBadge>
              <CalBadge variant="blue">Blue</CalBadge>
              <CalBadge variant="orange">Orange</CalBadge>
              <CalBadge variant="purple">Purple</CalBadge>
              <CalBadge variant="gray" size="sm">
                Small
              </CalBadge>
              <CalBadge variant="green" size="lg">
                Large
              </CalBadge>
            </PreviewBlock>

            <PreviewStack title="Segmented control">
              <SegmentedControl
                data={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ]}
                value={segment}
                onChange={setSegment}
              />
              <p className="text-subtle text-sm">Selected: {segment}</p>
            </PreviewStack>

            <PreviewStack title="Empty screen">
              <EmptyScreen
                Icon="calendar"
                headline="No events yet"
                description="Create your first event type to start accepting bookings."
                buttonText="Create event type"
                buttonOnClick={() => undefined}
                className="max-w-lg !p-7"
              />
            </PreviewStack>

            <PreviewBlock title="Arrow buttons & divider">
              <div className="group relative flex min-h-16 items-center pl-8">
                <ArrowButton
                  arrowDirection="up"
                  onClick={() => undefined}
                />
                <ArrowButton
                  arrowDirection="down"
                  onClick={() => undefined}
                />
                <span className="text-subtle text-sm">Scroll controls</span>
              </div>
              <div className="w-full max-w-md">
                <Divider />
              </div>
            </PreviewBlock>
          </PreviewGrid>
        </LibrarySection>

        <LibrarySection
          title="Design tokens"
          description="Semantic colors from packages/config/theme/tokens.css — surfaced through Tailwind utilities like bg-default, text-emphasis, and border-subtle."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Default", className: "bg-default border-subtle border" },
              { label: "Subtle", className: "bg-subtle border-subtle border" },
              { label: "Emphasis", className: "bg-emphasis border-subtle border" },
              { label: "Brand", className: "bg-brand-default text-brand border-brand-default border" },
              { label: "Success", className: "bg-cal-success text-success border-subtle border" },
              { label: "Attention", className: "bg-attention text-attention border-subtle border" },
              { label: "Error", className: "bg-error text-error border-subtle border" },
              { label: "Info", className: "bg-cal-info text-info border-subtle border" },
            ].map((swatch) => (
              <div
                key={swatch.label}
                {...SOURCE_SURFACE_ATTRS}
                className={`rounded-lg p-4 text-sm font-medium ${swatch.className}`}
              >
                {swatch.label}
              </div>
            ))}
          </div>
        </LibrarySection>
      </div>
      </TooltipProvider>
    </RadixTooltip.Provider>
  );
}
