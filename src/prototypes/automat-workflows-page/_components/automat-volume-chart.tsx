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
import { AUTOMAT_VOLUME_CHART_DATA } from "./automat-workflows-page-mock-data";

export function AutomatVolumeChart() {
  return (
    <PrototypeComponent id="automat-volume-chart">
      <Card className="flex h-[240px] flex-col gap-2 rounded-3xl border p-6">
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
                <Bar dataKey="volume" fill="#E5E7EB" radius={[2, 2, 0, 0]} barSize={39} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="url(#automatLineGradient)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
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
