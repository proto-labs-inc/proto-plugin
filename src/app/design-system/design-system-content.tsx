"use client";

import { Database } from "lucide-react";
import { useState } from "react";
import {
  DesignSystemPage,
  DesignSystemSection,
  PreviewBlock,
  PreviewGrid,
  PreviewStack,
} from "proto-plugin";
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
import { CodeBlock } from "ui-patterns/CodeBlock";
import { CollapsibleAlert } from "ui-patterns/collapsible-alert";
import { ComputeBadge } from "ui-patterns/ComputeBadge";
import { ConfirmationModal } from "ui-patterns/Dialogs/ConfirmationModal";
import { TextConfirmModal } from "ui-patterns/Dialogs/TextConfirmModal";
import { EmptyStatePresentational } from "ui-patterns/EmptyStatePresentational";
import { FormItemLayout } from "ui-patterns/form/FormItemLayout/FormItemLayout";
import { GlassPanel } from "ui-patterns/GlassPanel";
import { IconPanel } from "ui-patterns/IconPanel";
import { InfoTooltip } from "ui-patterns/info-tooltip";
import {
  MetricCard,
  MetricCardContent,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardValue,
} from "ui-patterns/MetricCard";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "ui-patterns/multi-select";
import {
  PageHeader,
  PageHeaderAside,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from "ui-patterns/PageHeader";
import {
  PageSection,
  PageSectionContent,
  PageSectionMeta,
  PageSectionSummary,
  PageSectionTitle,
} from "ui-patterns/PageSection";
import { ShimmeringLoader } from "ui-patterns/ShimmeringLoader";
import "ui-patterns/ShimmeringLoader/index.css";
import { StatusCode } from "ui-patterns/StatusCode";
import { TextLink } from "ui-patterns/TextLink";
import { TimestampInfo } from "ui-patterns/TimestampInfo";

import { TokensSection } from "./design-system-tokens.generated";

function UiPrimitivesSection() {
  const [tab, setTab] = useState<"tables" | "functions" | "replicas">("tables");

  return (
    <DesignSystemSection id="ui-primitives" title="UI primitives">
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
                Shared card primitive from the Supabase design system.
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
                  Dialog content from the synced Supabase ui package.
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
    </DesignSystemSection>
  );
}

function CompositeComponentsSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [textConfirmOpen, setTextConfirmOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(["auth"]);

  return (
    <DesignSystemSection id="composite-components" title="Composite components">
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

        <PreviewStack title="Collapsible alert">
          <CollapsibleAlert trigger="Migration notes" defaultOpen>
            <p className="text-foreground-light text-sm">
              Run this SQL before deploying to production.
            </p>
          </CollapsibleAlert>
          <CollapsibleAlert trigger="Destructive change" variant="destructive">
            <p className="text-foreground-light text-sm">
              Dropping this column cannot be undone.
            </p>
          </CollapsibleAlert>
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

        <PreviewStack title="Page header">
          <PageHeader>
            <PageHeaderMeta>
              <PageHeaderSummary>
                <PageHeaderTitle>Database</PageHeaderTitle>
                <PageHeaderDescription>
                  Manage tables, schemas, and relationships.
                </PageHeaderDescription>
              </PageHeaderSummary>
              <PageHeaderAside>
                <Button size="tiny" variant="primary">
                  New table
                </Button>
              </PageHeaderAside>
            </PageHeaderMeta>
          </PageHeader>
        </PreviewStack>

        <PreviewStack title="Page section">
          <PageSection>
            <PageSectionMeta>
              <PageSectionSummary>
                <PageSectionTitle>API keys</PageSectionTitle>
              </PageSectionSummary>
            </PageSectionMeta>
            <PageSectionContent>
              <p className="text-foreground-light text-sm">
                Manage the keys used to authenticate requests to your project.
              </p>
            </PageSectionContent>
          </PageSection>
        </PreviewStack>

        <PreviewStack title="Metric card">
          <MetricCard className="max-w-xs">
            <MetricCardHeader>
              <MetricCardLabel tooltip="Requests in the last 24 hours">
                API requests
              </MetricCardLabel>
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardValue>12,345</MetricCardValue>
            </MetricCardContent>
          </MetricCard>
        </PreviewStack>

        <PreviewStack title="Code block">
          <CodeBlock
            language="sql"
            value={`select *\nfrom auth.users\nwhere created_at > now() - interval '7 days';`}
          />
        </PreviewStack>

        <PreviewStack title="Multi select">
          <MultiSelector values={selectedTags} onValuesChange={setSelectedTags}>
            <MultiSelectorTrigger label="Select services" className="w-full" />
            <MultiSelectorContent>
              <MultiSelectorList>
                <MultiSelectorItem value="auth">Auth</MultiSelectorItem>
                <MultiSelectorItem value="storage">Storage</MultiSelectorItem>
                <MultiSelectorItem value="realtime">Realtime</MultiSelectorItem>
                <MultiSelectorItem value="functions">Edge Functions</MultiSelectorItem>
              </MultiSelectorList>
            </MultiSelectorContent>
          </MultiSelector>
        </PreviewStack>

        <PreviewStack title="Form item layout">
          <FormItemLayout
            isReactForm={false}
            id="table-name"
            label="Table name"
            description="Use lowercase letters and underscores."
          >
            <Input id="table-name" placeholder="column_name" />
          </FormItemLayout>
        </PreviewStack>

        <PreviewStack title="Confirmation modals">
          <div className="flex flex-wrap gap-3">
            <Button variant="default" onClick={() => setConfirmOpen(true)}>
              Open confirmation
            </Button>
            <Button variant="danger" onClick={() => setTextConfirmOpen(true)}>
              Open text confirm
            </Button>
          </div>
          <ConfirmationModal
            visible={confirmOpen}
            title="Confirm migration"
            description="This will apply pending migrations to your database."
            confirmLabel="Apply migration"
            onConfirm={() => setConfirmOpen(false)}
            onCancel={() => setConfirmOpen(false)}
          />
          <TextConfirmModal
            visible={textConfirmOpen}
            loading={false}
            title="Delete project"
            confirmString="delete"
            confirmPlaceholder="Type 'delete' to confirm"
            confirmLabel="Delete project"
            variant="destructive"
            onConfirm={() => setTextConfirmOpen(false)}
            onCancel={() => setTextConfirmOpen(false)}
          />
        </PreviewStack>

        <PreviewStack title="Panels">
          <div className="grid gap-4 sm:grid-cols-2">
            <IconPanel
              title="Postgres"
              tooltip="Managed Postgres database"
              icon={<Database size={20} />}
            />
            <GlassPanel title="Edge Functions">
              Run serverless TypeScript at the edge.
            </GlassPanel>
          </div>
        </PreviewStack>

        <PreviewStack title="Loading skeletons">
          <ShimmeringLoader className="h-4 w-64" />
          <ShimmeringLoader className="h-4 w-48" delayIndex={1} />
          <ShimmeringLoader className="h-4 w-56" delayIndex={2} />
        </PreviewStack>

        <PreviewBlock title="Inline elements">
          <ComputeBadge infraComputeSize="micro" />
          <ComputeBadge infraComputeSize="large" />
          <StatusCode method="GET" statusCode={200} />
          <StatusCode method="POST" statusCode={404} />
          <TextLink label="View documentation" url="https://supabase.com/docs" />
          <span className="text-foreground-light inline-flex items-center gap-1 text-sm">
            Row level security
            <InfoTooltip side="top">
              Restrict which rows a user can access.
            </InfoTooltip>
          </span>
          <span className="text-foreground-light text-sm">
            Created <TimestampInfo utcTimestamp="2024-06-01T12:00:00Z" />
          </span>
        </PreviewBlock>
      </PreviewGrid>
    </DesignSystemSection>
  );
}

function ColorsSection() {
  return (
    <DesignSystemSection id="colors" title="Colors">
      <TokensSection />
    </DesignSystemSection>
  );
}

export function DesignSystemContent() {
  return (
    <DesignSystemPage>
      <UiPrimitivesSection />
      <CompositeComponentsSection />
      <ColorsSection />
    </DesignSystemPage>
  );
}
