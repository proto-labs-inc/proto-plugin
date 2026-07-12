import { ProductSidebar, ProjectHeader } from "./project-shell";
import { TableEditorGrid } from "./table-editor-grid";
import { TableEditorMenu } from "./table-editor-menu";

export default function TableEditorStarterScreen() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-dash-sidebar">
      <ProjectHeader />

      <div className="flex flex-1 w-full overflow-y-hidden min-h-0">
        <ProductSidebar />

        <div className="flex flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-row h-full w-full">
            <div className="flex h-full w-full">
              <div
                className="h-full shrink-0 overflow-hidden"
                style={{ width: "28%", minWidth: 240, maxWidth: 360 }}
              >
                <TableEditorMenu />
              </div>

              <div
                aria-orientation="vertical"
                className="relative w-px shrink-0 bg-border hidden md:block"
                role="separator"
              />

              <div className="h-full flex-1 min-w-0 overflow-hidden">
                <TableEditorGrid />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
