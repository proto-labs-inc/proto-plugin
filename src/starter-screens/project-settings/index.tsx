import { GeneralSettings } from "./general-settings";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import { SettingsMenu } from "./settings-menu";

export default function ProjectSettingsStarterScreen() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-dash-sidebar">
      <ProjectHeader />

      <div className="flex flex-1 w-full overflow-y-hidden min-h-0">
        <ProductSidebar />

        <div className="flex flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-row h-full w-full">
            <SettingsMenu />
            <GeneralSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
