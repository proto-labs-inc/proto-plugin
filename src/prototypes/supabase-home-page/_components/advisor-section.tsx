import { Shield } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
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
import { Row } from "ui-patterns/Row";
import { ShimmeringLoader } from "ui-patterns/ShimmeringLoader";

import { MOCK_ADVISOR_ISSUE } from "./supabase-home-page-mock-data";
import type { AdvisorMode } from "./supabase-home-page-types";

type AdvisorSectionProps = {
  advisorMode: AdvisorMode;
  onDismissToEmpty: () => void;
};

function AdvisorEmptyState() {
  return (
    <Card className="bg-transparent h-64">
      <CardContent className="flex flex-col items-center justify-center gap-2 p-16 h-full">
        <Shield size={20} strokeWidth={1.5} className="text-foreground-muted" />
        <p className="text-sm text-foreground-light text-center">
          No security or performance issues found
        </p>
      </CardContent>
    </Card>
  );
}

export function AdvisorSection({ advisorMode, onDismissToEmpty }: AdvisorSectionProps) {
  const issue = MOCK_ADVISOR_ISSUE;

  if (advisorMode === "loading") {
    return (
      <PrototypeComponent id="advisor-section">
        <ShimmeringLoader className="w-96 mb-6" />
        <div className="flex flex-col gap-2">
          <ShimmeringLoader />
          <ShimmeringLoader className="w-3/4" />
          <ShimmeringLoader className="w-1/2" />
        </div>
      </PrototypeComponent>
    );
  }

  if (advisorMode === "empty") {
    return (
      <PrototypeComponent id="advisor-section">
        <div className="flex justify-between items-center mb-6">
          <h2>Advisor found no issues</h2>
          <Button variant="default" icon={<AiIconAnimation />}>
            Ask Assistant
          </Button>
        </div>
        <AdvisorEmptyState />
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent id="advisor-section">
      <div className="flex justify-between items-center mb-6">
        <h2>Advisor found 1 issue</h2>
        <Button variant="default" icon={<AiIconAnimation />}>
          Ask Assistant
        </Button>
      </div>

      <Row maxColumns={4} minWidth={280}>
        <Card
          className={cn(
            "min-h-full flex flex-col items-stretch cursor-pointer h-64",
            "bg-destructive-200 border-destructive-400",
          )}
          onClick={onDismissToEmpty}
        >
          <CardHeader className="border-b-0 shrink-0 flex flex-row gap-2 space-y-0 justify-between items-center">
            <div className="flex flex-row items-center gap-3">
              <Shield size={16} strokeWidth={1.5} className="text-destructive" />
              <CardTitle className="text-xs font-mono uppercase text-foreground-light">
                {issue.category}
              </CardTitle>
            </div>
            <Badge variant="destructive" className="w-fit uppercase text-[9px] tracking-[0.07em]">
              CRITICAL
            </Badge>
          </CardHeader>
          <CardContent className="p-6 pt-16 flex flex-col justify-end flex-1 overflow-auto">
            <h3 className="mb-1">{issue.title}</h3>
            <div className="text-sm text-foreground-light">
              <p>
                Table{" "}
                <code className="text-code-inline">{issue.tableName}</code> is public, but RLS has
                not been enabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </Row>
    </PrototypeComponent>
  );
}
