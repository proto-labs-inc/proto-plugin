"use client";

import { PrototypeComponent } from "proto-plugin";
import { Card, CardContent, CardHeader, CardTitle } from "@coss/ui/components/card";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import styles from "../automat-workflows-page.module.scss";
import {
  AUTOMAT_RECENT_ACTIVITY,
  AUTOMAT_VOLUME_CHART_DATA,
  getAutomatProjectDashboardData,
} from "./automat-workflows-page-mock-data";
import type { AutomatProjectId } from "./automat-workflows-page-types";
import type { AutomatAnalyticsVariant } from "./automat-analytics-content";

type AutomatAnalyticsBlockProps = {
  variant: AutomatAnalyticsVariant;
  projectId: AutomatProjectId;
  embedded?: boolean;
};

function AutomatKpiStrip({
  projectId,
  compact = false,
}: {
  projectId: AutomatProjectId;
  compact?: boolean;
}) {
  const { activeWorkflowCount, agenticCount, idpCount } =
    getAutomatProjectDashboardData(projectId);

  return (
    <PrototypeComponent
      id="automat-analytics-kpi-strip"
      className={
        compact
          ? "grid grid-cols-3 gap-3"
          : "grid grid-cols-3 gap-4 rounded-3xl border bg-card p-4"
      }
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Active workflows</span>
        <span className={compact ? "text-2xl font-semibold" : "text-3xl font-semibold"}>
          {activeWorkflowCount}
        </span>
      </div>
      <div className="flex flex-col gap-1 border-l pl-4">
        <span className="text-xs text-muted-foreground">Agentic</span>
        <span className={compact ? "text-2xl font-semibold" : "text-3xl font-semibold"}>
          {agenticCount}
        </span>
      </div>
      <div className="flex flex-col gap-1 border-l pl-4">
        <span className="text-xs text-muted-foreground">IDP processors</span>
        <span className={compact ? "text-2xl font-semibold" : "text-3xl font-semibold"}>
          {idpCount}
        </span>
      </div>
    </PrototypeComponent>
  );
}

function AutomatVolumeChartSection({
  embedded = false,
  borderless = false,
  className,
}: {
  embedded?: boolean;
  borderless?: boolean;
  className?: string;
}) {
  const heightClass = embedded ? "h-[140px]" : "h-[240px]";

  return (
    <PrototypeComponent id="automat-volume-chart" className={className}>
      <Card
        className={`flex ${heightClass} flex-col gap-2 ${borderless ? "border-0 bg-transparent p-0 shadow-none" : "rounded-3xl border p-6"}`}
      >
        <CardHeader className="grid shrink-0 auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="font-semibold leading-none">Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 flex-col p-0 pb-0">
          <div className="absolute top-2 right-2 z-10">
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${styles.chartTrend}`}>
              ↗ +12.5%
            </div>
          </div>
          <div className="relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={AUTOMAT_VOLUME_CHART_DATA}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="automatLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1a75e4" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="#1a75e4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1a75e4" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  dy={8}
                />
                <Bar dataKey="volume" fill="#E5E7EB" radius={[2, 2, 0, 0]} barSize={embedded ? 24 : 39} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="url(#automatLineGradient)"
                  strokeWidth={3}
                  dot={{
                    r: embedded ? 3 : 4,
                    fill: "#1a75e4",
                    stroke: "url(#automatLineGradient)",
                    strokeWidth: 2,
                  }}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}

function AutomatStatsCardSection({
  projectId,
  embedded = false,
  borderless = false,
  compact = false,
}: {
  projectId: AutomatProjectId;
  embedded?: boolean;
  borderless?: boolean;
  compact?: boolean;
}) {
  const { activeWorkflowCount, agenticCount, idpCount } =
    getAutomatProjectDashboardData(projectId);
  const heightClass = embedded ? "h-[140px]" : compact ? "h-auto" : "h-[240px]";

  return (
    <PrototypeComponent id="automat-stats-cards">
      <Card
        className={`flex ${heightClass} flex-col gap-2 ${borderless ? "border-0 bg-transparent p-0 shadow-none" : "rounded-3xl border p-6"}`}
      >
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="font-semibold leading-none">Active Workflows</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col p-0">
          <div className={compact ? "text-3xl font-semibold" : "text-5xl font-semibold"}>
            {activeWorkflowCount}
          </div>
          <div className="mt-auto flex items-center text-sm text-muted-foreground">
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">Agentic Workflows</span>
              <span className="font-medium text-foreground">{agenticCount}</span>
            </div>
            <div className="mx-4 h-12 w-px bg-border" />
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">IDP Processors</span>
              <span className="font-medium text-foreground">{idpCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}

function AutomatActivitySection({
  embedded = false,
  borderless = false,
  timeline = false,
  className,
}: {
  embedded?: boolean;
  borderless?: boolean;
  timeline?: boolean;
  className?: string;
}) {
  const heightClass = embedded ? "max-h-[120px]" : "max-h-[240px]";
  const items = AUTOMAT_RECENT_ACTIVITY.slice(0, embedded ? 3 : undefined);

  return (
    <PrototypeComponent id="automat-recent-activity" className={className}>
      <Card
        className={`flex ${heightClass} flex-col gap-2 ${borderless ? "border-0 bg-transparent p-0 shadow-none" : "rounded-3xl border p-6"}`}
      >
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="mb-3 font-semibold leading-none">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent
          className={`-mb-6 overflow-y-auto p-0 ${timeline ? "space-y-4 border-l border-border pl-4" : "space-y-6"}`}
        >
          {items.map((item) => (
            <PrototypeComponent
              key={item.id}
              id={`activity-item.${item.id}`}
              className={`flex items-start justify-between ${timeline ? "relative -ml-4 pl-4 before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-primary" : ""}`}
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</p>
            </PrototypeComponent>
          ))}
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}

function SplitGridLayout({ projectId, embedded }: AutomatAnalyticsBlockProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <AutomatStatsCardSection projectId={projectId} embedded={embedded} />
        <AutomatVolumeChartSection embedded={embedded} />
      </div>
      <AutomatActivitySection embedded={embedded} />
    </div>
  );
}

function KpiStripLayout({ projectId, embedded }: AutomatAnalyticsBlockProps) {
  return (
    <div className="flex flex-col gap-4">
      <AutomatKpiStrip projectId={projectId} compact={embedded} />
      <AutomatVolumeChartSection embedded={embedded} />
      <AutomatActivitySection embedded={embedded} timeline />
    </div>
  );
}

function UnifiedPanelLayout({ projectId, embedded }: AutomatAnalyticsBlockProps) {
  return (
    <Card className="flex flex-col gap-0 rounded-3xl border p-6">
      <AutomatStatsCardSection
        projectId={projectId}
        embedded={embedded}
        borderless
        compact
      />
      <div className="my-4 h-px bg-border" />
      <AutomatVolumeChartSection embedded={embedded} borderless />
      <div className="my-4 h-px bg-border" />
      <AutomatActivitySection embedded={embedded} borderless />
    </Card>
  );
}

function ChartHeroLayout({ projectId, embedded }: AutomatAnalyticsBlockProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <AutomatVolumeChartSection embedded={embedded} />
        <AutomatStatsCardSection
          projectId={projectId}
          embedded={embedded}
          compact
        />
      </div>
      <AutomatActivitySection embedded={embedded} />
    </div>
  );
}

function ActivityRailLayout({ projectId, embedded }: AutomatAnalyticsBlockProps) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-4">
      <div className="flex flex-col gap-4">
        <AutomatStatsCardSection
          projectId={projectId}
          embedded={embedded}
          compact
        />
        <AutomatVolumeChartSection embedded={embedded} className="flex-1" />
      </div>
      <AutomatActivitySection embedded={embedded} className="h-full min-h-0" />
    </div>
  );
}

export function AutomatAnalyticsBlock({
  variant,
  projectId,
  embedded = false,
}: AutomatAnalyticsBlockProps) {
  const layoutProps = { variant, projectId, embedded };

  return (
    <PrototypeComponent id="automat-analytics-block">
      {variant === "split-grid" ? <SplitGridLayout {...layoutProps} /> : null}
      {variant === "kpi-strip" ? <KpiStripLayout {...layoutProps} /> : null}
      {variant === "unified-panel" ? <UnifiedPanelLayout {...layoutProps} /> : null}
      {variant === "chart-hero" ? <ChartHeroLayout {...layoutProps} /> : null}
      {variant === "activity-rail" ? <ActivityRailLayout {...layoutProps} /> : null}
    </PrototypeComponent>
  );
}
