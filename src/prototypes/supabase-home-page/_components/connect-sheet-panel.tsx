import { Box } from "lucide-react";
import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { Button, SidePanel } from "ui";

import { MOCK_PROJECT } from "./supabase-home-page-mock-data";
import type { ConnectSheetMode } from "./supabase-home-page-types";

type ConnectSheetPanelProps = {
  connectSheet: ConnectSheetMode;
  onClose: () => void;
};

export function ConnectSheetPanel({ connectSheet, onClose }: ConnectSheetPanelProps) {
  const portalContainer = usePrototypeProductOverlayPortal();
  const visible = connectSheet !== "none";

  return (
    <PrototypeComponent id="connect-sheet-panel">
      <SidePanel
        visible={visible}
        onCancel={onClose}
        portalContainer={portalContainer}
        hideFooter
        header={
          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground-light">Connect to your project</span>
            <span className="text-base font-medium">Framework</span>
          </div>
        }
        size="large"
      >
        <div className="flex flex-col gap-y-6 p-6">
          <div className="flex items-center gap-2 text-foreground-light">
            <Box size={16} strokeWidth={1.5} />
            <span className="text-sm">Framework connection</span>
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="text-sm text-foreground-light">Project URL</label>
            <code className="text-code-inline block rounded-md border border-default bg-surface-100 px-3 py-2 text-sm">
              {MOCK_PROJECT.apiUrl}
            </code>
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="text-sm text-foreground-light">Anon key</label>
            <code className="text-code-inline block rounded-md border border-default bg-surface-100 px-3 py-2 text-sm break-all">
              {MOCK_PROJECT.anonKey}
            </code>
          </div>

          <pre className="font-mono text-sm rounded-md border border-default bg-surface-100 p-4 overflow-x-auto">
            {`import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  '${MOCK_PROJECT.apiUrl}',
  '${MOCK_PROJECT.anonKey}'
)`}
          </pre>

          <div className="flex justify-end">
            <Button type="button" variant="default" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </SidePanel>
    </PrototypeComponent>
  );
}
