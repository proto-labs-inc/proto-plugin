"use client";

import { PrototypeComponent } from "proto-plugin";
import { Card, CardContent, CardHeader, CardTitle } from "@coss/ui/components/card";

import { AUTOMAT_RECENT_ACTIVITY } from "./automat-workflows-page-mock-data";

export function AutomatRecentActivity() {
  return (
    <PrototypeComponent id="automat-recent-activity">
      <Card className="flex max-h-[240px] flex-col gap-2 rounded-3xl border p-6">
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="mb-3 font-semibold leading-none">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="-mb-6 space-y-6 overflow-y-auto p-0">
          {AUTOMAT_RECENT_ACTIVITY.map((item) => (
            <PrototypeComponent
              key={item.id}
              id={`activity-item.${item.id}`}
              className="flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.timestamp}</p>
            </PrototypeComponent>
          ))}
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}
